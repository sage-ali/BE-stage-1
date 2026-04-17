import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { ExternalApiError } from '../errors/ExternalApiError';
import { NoPredictionError } from '../errors/NoPredictionError';
import { ValidationError } from '../errors/ValidationError';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

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

    // Use Pino logger instead of console.error
    this.logger.error(
      {
        method: request.method,
        url: request.url,
        status,
        message,
        exception:
          exception instanceof Error ? exception.message : String(exception),
      },
      'Unhandled exception occurred',
    );

    response.status(status).json({
      status: 'error',
      message,
    });
  }
}
