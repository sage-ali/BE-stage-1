import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const dbUrl = process.env.DATABASE_URL;

    if (typeof dbUrl !== 'string' || dbUrl.trim() === '') {
      throw new Error(
        'CRITICAL BOOT FAILURE: DATABASE_URL environment variable is missing or not a string.',
      );
    }

    // 1. Wrap the database connection string in the Prisma 7 adapter
    const adapter = new PrismaPg(dbUrl);

    // 2. Pass the adapter to the PrismaClient constructor
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
