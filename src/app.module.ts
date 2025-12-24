import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DebtModule } from './debt/debt.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, DebtModule, PaymentMethodModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
