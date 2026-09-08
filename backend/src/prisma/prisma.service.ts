import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  /** Close the pool cleanly on SIGTERM (Docker stop, nodemon restart). */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
