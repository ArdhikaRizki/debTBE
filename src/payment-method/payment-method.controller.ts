import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/create-payment-method.dto';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.paymentMethodService.findAll(req.user.userId);
  }

  @Get('primary')
  async getPrimary(@Request() req) {
    return this.paymentMethodService.getPrimary(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.paymentMethodService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.paymentMethodService.delete(id, req.user.userId);
    return { ok: true };
  }

  @Post(':id/set-primary')
  async setPrimary(@Request() req, @Param('id') id: string) {
    return this.paymentMethodService.setPrimary(id, req.user.userId);
  }
}
