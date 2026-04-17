import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
@ApiTags('health')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns a welcome message indicating the API is running.',
  })
  @ApiResponse({ status: 200, description: 'API is running' })
  getHello(): string {
    this.logger.log('GET / endpoint called');
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Service health status',
    description: 'Returns the health status of the service.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: { example: { status: 'ok' } },
  })
  getHealth(): { status: string } {
    this.logger.log('GET /health endpoint called');
    return { status: 'ok' };
  }
}
