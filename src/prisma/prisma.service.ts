
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient | null = null;
  private pool: Pool | null = null;

  constructor() {
    // Empty; initialization deferred to onModuleInit
  }

  async onModuleInit() {
    // Delay Pool + Prisma initialization until env is guaranteed loaded
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }
    
    this.pool = new Pool({ connectionString });
    const adapter = new PrismaPg(this.pool);
    this.prisma = new PrismaClient({ adapter });
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    if (this.prisma) await this.prisma.$disconnect();
    if (this.pool) await this.pool.end();
  }

  private getPrisma(): PrismaClient {
    if (!this.prisma) {
      throw new Error('PrismaService not initialized. Check that DATABASE_URL is set and onModuleInit completed.');
    }
    return this.prisma;
  }

  // Expose Prisma Client methods
  get user() {
    return this.getPrisma().user;
  }

  get debt() {
    return this.getPrisma().debt;
  }

  get debtGroup() {
    return this.getPrisma().debtGroup;
  }

  get groupMember() {
    return this.getPrisma().groupMember;
  }

  get groupTransaction() {
    return this.getPrisma().groupTransaction;
  }

  get settlementRequest() {
    return this.getPrisma().settlementRequest;
  }

  get paymentMethod() {
    return this.getPrisma().paymentMethod;
  }
}
