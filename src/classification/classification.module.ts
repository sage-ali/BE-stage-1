import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClassificationService } from './classification.service';
import { ClassificationController } from './classification.controller';

@Module({
  imports: [HttpModule],
  controllers: [ClassificationController],
  providers: [ClassificationService],
})
export class ClassificationModule {}
