import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/ValidationError';

export const validateNameParam = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.query;

  if (name === undefined || (typeof name === 'string' && name.trim() === '')) {
    return next(new ValidationError('Name query parameter is required and cannot be empty', 400));
  }

  if (typeof name !== 'string' || Array.isArray(name) || typeof name === 'object') {
    return next(new ValidationError('Name query parameter must be a string', 422));
  }

  next();
};
