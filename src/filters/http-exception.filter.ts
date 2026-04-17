import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExternalApiError } from '../errors/ExternalApiError';
import { NoPredictionError } from '../errors/NoPredictionError';
import { ValidationError } from '../errors/ValidationError';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'An unexpected error occurred';

    if (exception instanceof ValidationError) {
      status = exception.status || 400;
      message = exception.message;
    } else if (exception instanceof ExternalApiError) {
      status = exception.status || 502;
      message = exception.message;
    } else if (exception instanceof NoPredictionError) {
      status = exception.status || 404;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as { message: string }).message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    console.error(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`,
      exception,
    );

    response.status(status).json({
      status: 'error',
      message,
    });
  }
}
