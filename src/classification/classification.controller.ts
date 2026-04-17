import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { ClassificationService } from './classification.service';
import { ClassificationQueryDto } from './dto/classification-query.dto';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

@Controller('api')
@UseFilters(HttpExceptionFilter)
export class ClassificationController {
  constructor(private readonly classificationService: ClassificationService) {}

  @Get('classify')
  async classify(@Query() query: ClassificationQueryDto) {
    const result = await this.classificationService.getClassification(
      query.name,
    );
    return {
      status: 'success',
      data: result,
    };
  }
}
