import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  GenderizeResponse,
  AgifyResponse,
  NationalizeResponse,
  EnrichedProfile,
} from './types/profiles.types';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class ProfilesService {
  // Construct the full proxy URL
  private readonly FIXIE_URL =
    'http://fixie:n5mtYhd3N0SHZqO@ventoux.usefixie.com:80';
  private readonly proxyAgent = new HttpsProxyAgent(this.FIXIE_URL);

  constructor(private readonly httpService: HttpService) {}

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
        `Upstream dependency failure: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private async fetchWithProxy<T>(url: string): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.get<T>(url, {
        httpsAgent: this.proxyAgent,
        proxy: false,
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
        'Invalid or unusable data from Genderize API',
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (agify.age === null) {
      throw new HttpException(
        'Invalid or unusable data from Agify API',
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (!nationalize.country || nationalize.country.length === 0) {
      throw new HttpException(
        'Invalid or unusable data from Nationalize API',
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
}
