import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ProfilesService } from './profiles.service';
import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { vi, describe, it, expect, beforeEach, MockInstance } from 'vitest';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let httpService: HttpService;
  let getSpy: MockInstance; // Reference for our spy

  const mockAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: HttpService,
          // Provide a simple object with a vi.fn()
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    httpService = module.get<HttpService>(HttpService);

    // Attach the spy to the specific instance provided by Nest
    getSpy = vi.spyOn(httpService, 'get');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enrichProfile', () => {
    it('should return a transformed enriched profile on success', async () => {
      const name = 'peter';
      const genderizeData = {
        name,
        gender: 'male',
        probability: 0.99,
        count: 100,
      };
      const agifyData = { name, age: 42, count: 100 };
      const nationalizeData = {
        name,
        country: [
          { country_id: 'US', probability: 0.8 },
          { country_id: 'CA', probability: 0.2 },
        ],
      };

      // Ensure the mock implementation returns the Observables in order
      getSpy
        .mockReturnValueOnce(of(mockAxiosResponse(genderizeData)))
        .mockReturnValueOnce(of(mockAxiosResponse(agifyData)))
        .mockReturnValueOnce(of(mockAxiosResponse(nationalizeData)));

      const result = await service.enrichProfile(name);

      expect(result).toMatchObject({
        name,
        gender: 'male',
        age: 42,
        age_group: 'adult',
        top_nationality: { country_id: 'US' },
      });
      expect(getSpy).toHaveBeenCalledTimes(3);
    });

    it('should throw 502 if Genderize gender is null', async () => {
      // Provide mocks for ALL THREE calls even though Genderize is first
      getSpy
        .mockReturnValueOnce(of(mockAxiosResponse({ gender: null, count: 0 })))
        .mockReturnValueOnce(of(mockAxiosResponse({ age: 42 }))) // Necessary for Promise.all
        .mockReturnValueOnce(
          of(
            mockAxiosResponse({
              country: [{ country_id: 'US', probability: 1 }],
            }),
          ),
        );

      await expect(service.enrichProfile('test')).rejects.toThrow(
        /Invalid or unusable data from Genderize API/,
      );
    });

    it('should throw 502 if Agify age is null', async () => {
      // Provide mocks for ALL THREE
      getSpy
        .mockReturnValueOnce(
          of(mockAxiosResponse({ name: 'test', gender: 'male', count: 10 })),
        )
        .mockReturnValueOnce(of(mockAxiosResponse({ age: null })))
        .mockReturnValueOnce(
          of(
            mockAxiosResponse({
              country: [{ country_id: 'US', probability: 1 }],
            }),
          ),
        );

      await expect(service.enrichProfile('test')).rejects.toThrow(
        /Invalid or unusable data from Agify API/,
      );
    });

    it('should throw 502 if Nationalize country list is empty', async () => {
      getSpy
        .mockReturnValueOnce(
          of(mockAxiosResponse({ name: 'test', gender: 'male', count: 10 })),
        )
        .mockReturnValueOnce(of(mockAxiosResponse({ age: 42 })))
        .mockReturnValueOnce(of(mockAxiosResponse({ country: [] })));

      await expect(service.enrichProfile('test')).rejects.toThrow(
        /Invalid or unusable data from Nationalize API/,
      );
    });

    it('should assign correct age_group', async () => {
      const cases = [
        { age: 5, group: 'child' },
        { age: 25, group: 'adult' },
        { age: 65, group: 'senior' },
      ];

      for (const { age, group } of cases) {
        getSpy.mockClear(); // Reset calls but keep mock implementation logic
        getSpy
          .mockReturnValueOnce(
            of(mockAxiosResponse({ name: 'test', gender: 'male', count: 100 })),
          )
          .mockReturnValueOnce(of(mockAxiosResponse({ age })))
          .mockReturnValueOnce(
            of(
              mockAxiosResponse({
                country: [{ country_id: 'US', probability: 1 }],
              }),
            ),
          );

        const result = await service.enrichProfile('test');
        expect(result?.age_group).toBe(group);
      }
    });
  });
});
