
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private pool: Pool;

  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(this.pool);
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    await this.pool.end();
  }

  // Expose Prisma Client methods
  get user() {
    return this.prisma.user;
  }

  get debt() {
    return this.prisma.debt;
  }

  get debtGroup() {
    return this.prisma.debtGroup;
  }

  get groupMember() {
    return this.prisma.groupMember;
  }

  get groupTransaction() {
    return this.prisma.groupTransaction;
  }

  get settlementRequest() {
    return this.prisma.settlementRequest;
  }
}
