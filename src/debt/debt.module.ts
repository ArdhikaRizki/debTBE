import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { DebtCrudService } from './debt-crud.service';
import { DebtCrudController } from './debt-crud.controller';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupTransactionService } from './group-transaction.service';
import { GroupTransactionController } from './group-transaction.controller';
import { SettlementRequestService } from './settlement-request.service';
import { SettlementRequestController } from './settlement-request.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    DebtController,
    DebtCrudController,
    GroupController,
    GroupTransactionController,
    SettlementRequestController,
  ],
  providers: [
    DebtService,
    DebtCrudService,
    GroupService,
    GroupTransactionService,
    SettlementRequestService,
  ],
  exports: [
    DebtService,
    DebtCrudService,
    GroupService,
    GroupTransactionService,
    SettlementRequestService,
  ],
})
export class DebtModule {}
