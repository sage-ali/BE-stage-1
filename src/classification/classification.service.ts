import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ExternalApiError } from '../errors/ExternalApiError';
import { NoPredictionError } from '../errors/NoPredictionError';
import {
  GenderizeResponse,
  TransformedGenderizeResponse,
} from './types/genderize.types';

@Injectable()
export class ClassificationService {
  private readonly GENDERIZE_API_TIMEOUT_MS = 5000;

  constructor(private readonly httpService: HttpService) {}

  async getClassification(name: string): Promise<TransformedGenderizeResponse> {
    const url = new URL('https://api.genderize.io');
    url.searchParams.set('name', name);

    try {
      const response = await firstValueFrom(
        this.httpService.get<GenderizeResponse>(url.toString(), {
          timeout: this.GENDERIZE_API_TIMEOUT_MS,
        }),
      );

      const data = response.data;

      // Check for inconclusive prediction BEFORE transformations
      if (data.gender === null || data.count === 0) {
        throw new NoPredictionError(
          'No prediction available for the provided name',
        );
      }

      // Apply transformations
      const sample_size = data.count;
      const is_confident =
        data.probability !== null &&
        data.probability >= 0.7 &&
        sample_size >= 100;
      const processed_at = new Date().toISOString();

      return {
        name: data.name,
        gender: data.gender,
        probability: data.probability,
        sample_size: sample_size,
        is_confident: is_confident,
        processed_at: processed_at,
      };
    } catch (error: unknown) {
      if (error instanceof NoPredictionError) {
        throw error;
      }

      if (error instanceof AxiosError) {
        if (
          error.code === 'ECONNABORTED' ||
          error.message?.includes('timeout')
        ) {
          throw new ExternalApiError(
            `Genderize API request timed out after ${this.GENDERIZE_API_TIMEOUT_MS}ms`,
            504,
          );
        }

        if (error.response) {
          const errorText = error.response.data as string;
          console.error(
            `Genderize API returned non-OK status: ${error.response.status} - ${errorText}`,
          );
          throw new ExternalApiError(
            'Genderize API returned non-OK status',
            502,
          );
        } else if (error.request) {
          throw new ExternalApiError(
            `Failed to fetch from Genderize API: ${error.message}`,
            502,
          );
        }
      }

      // Something happened in setting up the request or unknown error
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new ExternalApiError(
        `An unknown error occurred while fetching from Genderize API: ${errorMessage}`,
        502,
      );
    }
  }
}
