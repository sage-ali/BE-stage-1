import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  GenderizeResponse,
  AgifyResponse,
  NationalizeResponse,
  EnrichedProfile,
} from './types/profiles.types';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { uuidv7 } from 'uuidv7';
import { Prisma } from '@prisma/client';

// Check it here, outside the class
const FIXIE_URL = process.env.FIXIE_URL;
if (!FIXIE_URL) {
  throw new Error('FIXIE_URL environment variable is not set');
}

@Injectable()
export class ProfilesService {
  private readonly proxyAgent = new HttpsProxyAgent(FIXIE_URL);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async enrichProfile(name: string): Promise<EnrichedProfile | undefined> {
    const urls = {
      genderize: `https://api.genderize.io?name=${name}`,
      agify: `https://api.agify.io?name=${name}`,
      nationalize: `https://api.nationalize.io?name=${name}`,
    };

    try {
      const [genderizeRes, agifyRes, nationalizeRes] = await Promise.all([
        this.fetchWithProxy<GenderizeResponse>(urls.genderize),
        this.fetchWithProxy<AgifyResponse>(urls.agify),
        this.fetchWithProxy<NationalizeResponse>(urls.nationalize),
      ]);

      this.validateResponses(genderizeRes, agifyRes, nationalizeRes);

      return this.transformData(genderizeRes, agifyRes, nationalizeRes);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Upstream or server failure',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private readonly UPSTREAM_TIMEOUT_MS = 3000;

  private async fetchWithProxy<T>(url: string): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.get<T>(url, {
        httpsAgent: this.proxyAgent,
        proxy: false,
        timeout: this.UPSTREAM_TIMEOUT_MS,
      }),
    );
    return response.data;
  }

  private validateResponses(
    genderize: GenderizeResponse,
    agify: AgifyResponse,
    nationalize: NationalizeResponse,
  ): void {
    if (genderize.gender === null || genderize.count === 0) {
      throw new HttpException(
        'Genderize returned an invalid response',
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (agify.age === null) {
      throw new HttpException(
        'Agify returned an invalid response',
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (!nationalize.country || nationalize.country.length === 0) {
      throw new HttpException(
        'Nationalize returned an invalid response',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private transformData(
    genderize: GenderizeResponse,
    agify: AgifyResponse,
    nationalize: NationalizeResponse,
  ): EnrichedProfile {
    const sortedCountries = [...nationalize.country].sort(
      (a, b) => b.probability - a.probability,
    );

    const topNationality = sortedCountries[0];

    return {
      name: genderize.name,
      gender: genderize.gender as string,
      probability: genderize.probability,
      sample_size: genderize.count,
      age: agify.age as number,
      age_group: this.getAgeGroup(agify.age as number),
      top_nationality: {
        country_id: topNationality.country_id,
        probability: topNationality.probability,
      },
      countries: sortedCountries,
    };
  }

  private getAgeGroup(age: number): 'child' | 'teenager' | 'adult' | 'senior' {
    if (age <= 12) return 'child';
    if (age <= 19) return 'teenager';
    if (age <= 59) return 'adult';
    return 'senior';
  }

  async createProfile(name: string) {
    // Normalize name to lowercase
    const normalizedName = name.toLowerCase();

    // Check for existing profile (idempotency)
    const existingProfile = await this.prisma.profile.findUnique({
      where: { name: normalizedName },
    });

    if (existingProfile) {
      return {
        existing: true,
        profile: existingProfile,
      };
    }

    // Enrich profile data
    const enrichedData = await this.enrichProfile(normalizedName);

    if (!enrichedData) {
      throw new HttpException(
        'Failed to enrich profile data',
        HttpStatus.BAD_GATEWAY,
      );
    }

    // Generate UUID v7
    const id = uuidv7();

    // Create new profile
    const newProfile = await this.prisma.profile.create({
      data: {
        id,
        name: normalizedName,
        gender: enrichedData.gender,
        gender_probability: enrichedData.probability || 0,
        sample_size: enrichedData.sample_size,
        age: enrichedData.age,
        age_group: enrichedData.age_group,
        country_id: enrichedData.top_nationality.country_id,
        country_probability: enrichedData.top_nationality.probability,
        created_at: new Date(),
      },
    });

    return {
      existing: false,
      profile: newProfile,
    };
  }

  async findProfileById(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }

  async findAllProfiles(filters: {
    gender?: string;
    country_id?: string;
    age_group?: string;
  }) {
    const where: {
      gender?: string;
      country_id?: string;
      age_group?: string;
    } = {};

    if (filters.gender) {
      where.gender = filters.gender.toLowerCase();
    }

    if (filters.country_id) {
      where.country_id = filters.country_id.toUpperCase();
    }

    if (filters.age_group) {
      where.age_group = filters.age_group.toLowerCase();
    }

    const [count, data] = await Promise.all([
      this.prisma.profile.count({ where }),
      this.prisma.profile.findMany({
        where,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return { count, data };
  }

  async deleteProfile(id: string) {
    try {
      return await this.prisma.profile.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException('Profile not found');
      }
      throw error;
    }
  }
}
