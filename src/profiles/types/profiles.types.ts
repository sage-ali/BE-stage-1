export interface GenderizeResponse {
  name: string;
  gender: string | null;
  probability: number | null;
  count: number;
}

export interface AgifyResponse {
  name: string;
  age: number | null;
  count: number;
}

export interface NationalizeCountry {
  country_id: string;
  probability: number;
}

export interface NationalizeResponse {
  name: string;
  country: NationalizeCountry[];
}

export interface EnrichedProfile {
  name: string;
  gender: string;
  probability: number | null;
  sample_size: number;
  age: number;
  age_group: 'child' | 'teenager' | 'adult' | 'senior';
  top_nationality: {
    country_id: string;
    probability: number;
  };
  countries: NationalizeCountry[];
}
