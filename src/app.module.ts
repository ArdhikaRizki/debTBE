import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DebtModule } from './debt/debt.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, DebtModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
