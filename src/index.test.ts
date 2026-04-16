import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { validateNameParam } from './middleware/validateNameParam';
import { getGenderFromName } from './services/genderizeService';

// We need to recreate the app instance for testing to ensure it's clean
// or we can import the app if it was exported from index.ts.
// Since index.ts starts the server, we'll recreate the test app here.

const app = express();
app.use(cors({ origin: '*' }));
app.get('/', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/classify', validateNameParam, async (req, res, next) => {
  try {
    const name = req.query.name as string;
    const genderizeResult = await getGenderFromName(name);
    res.status(200).json({ status: 'success', data: genderizeResult });
  } catch (error) {
    next(error);
  }
});
app.use(errorHandler);

// Mock the genderizeService to avoid real API calls
vi.mock('./services/genderizeService', () => ({
  getGenderFromName: vi.fn(),
}));

describe('Name Gender Classification API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return 200 OK with status ok', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /health', () => {
    it('should return 200 OK with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/classify', () => {
    it('should return 200 OK for a valid name', async () => {
      const mockResult = {
        name: 'john',
        gender: 'male',
        probability: 0.99,
        sample_size: 10000,
        is_confident: true,
        processed_at: new Date().toISOString(),
      };
      (getGenderFromName as any).mockResolvedValue(mockResult);

      const res = await request(app).get('/api/classify?name=john');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'success', data: mockResult });
    });

    it('should return 400 Bad Request if name is missing', async () => {
      const res = await request(app).get('/api/classify');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('required');
    });

    it('should return 400 Bad Request if name is empty', async () => {
      const res = await request(app).get('/api/classify?name=');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('cannot be empty');
    });

    it('should return 422 Unprocessable Entity if name is not a string (e.g., array)', async () => {
      // Express query parser can return arrays for repeated params
      const res = await request(app).get('/api/classify?name=john&name=doe');
      expect(res.status).toBe(422);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('must be a string');
    });

    it('should handle service errors correctly', async () => {
      const mockError = new Error('Service Error');
      (mockError as any).status = 502;
      (getGenderFromName as any).mockRejectedValue(mockError);

      const res = await request(app).get('/api/classify?name=error');
      expect(res.status).toBe(502);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Service Error');
    });
  });
});
