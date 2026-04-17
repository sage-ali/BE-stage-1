import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClassificationModule } from './classification/classification.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                },
              }
            : undefined,
        level: process.env.LOG_LEVEL || 'info',
      },
    }),
    PrismaModule,
    ClassificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
