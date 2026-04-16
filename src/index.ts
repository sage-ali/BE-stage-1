import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { validateNameParam } from './middleware/validateNameParam';
import { getGenderFromName } from './services/genderizeService';

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Apply CORS middleware before all route handlers
app.use(cors({ origin: '*' }));

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.get('/api/classify', validateNameParam, async (req, res, next) => {
  try {
    const name = req.query.name as string;
    const genderizeResult = await getGenderFromName(name);
    res.status(200).json({ status: 'success', data: genderizeResult });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
});

// Optional error test route
app.get('/error-test', (req, res, next) => {
  const error = new Error('This is a test error!');
  (error as any).status = 400;
  next(error);
});

// Register the global error handling middleware after all route handlers
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
