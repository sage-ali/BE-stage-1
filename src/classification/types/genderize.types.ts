export interface GenderizeResponse {
  count: number;
  name: string;
  gender: string | null;
  probability: number | null;
}

export interface TransformedGenderizeResponse {
  name: string;
  gender: string | null;
  probability: number | null;
  sample_size: number;
  is_confident: boolean;
  processed_at: string;
}
