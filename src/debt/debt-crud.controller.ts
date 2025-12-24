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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DebtCrudService } from './debt-crud.service';
import { CreateDebtDto, UpdateDebtDto } from './dto/debt-crud.dto';

@Controller('debts/crud')
@UseGuards(JwtAuthGuard)
export class DebtCrudController {
  constructor(private readonly debtCrudService: DebtCrudService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateDebtDto) {
    return this.debtCrudService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('type') type?: string,
    @Query('isPaid') isPaid?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};
    if (type) filters.type = type;
    if (isPaid !== undefined) filters.isPaid = isPaid === 'true';
    if (status) filters.status = status;

    return this.debtCrudService.findAll(req.user.userId, filters);
  }

  @Get('summary')
  async getSummary(@Request() req) {
    return this.debtCrudService.getSummary(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.debtCrudService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateDebtDto) {
    return this.debtCrudService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.debtCrudService.delete(id, req.user.userId);
    return { ok: true };
  }

  @Post(':id/mark-paid')
  async markPaid(@Request() req, @Param('id') id: string) {
    return this.debtCrudService.markPaid(id, req.user.userId);
  }

  @Post(':id/mark-unpaid')
  async markUnpaid(@Request() req, @Param('id') id: string) {
    return this.debtCrudService.markUnpaid(id, req.user.userId);
  }
}
