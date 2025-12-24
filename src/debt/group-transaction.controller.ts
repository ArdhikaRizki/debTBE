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
import { GroupTransactionService } from './group-transaction.service';
import { CreateGroupTransactionDto, UpdateGroupTransactionDto } from './dto/group-transaction.dto';

@Controller('group-transactions')
@UseGuards(JwtAuthGuard)
export class GroupTransactionController {
  constructor(private readonly groupTransactionService: GroupTransactionService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateGroupTransactionDto) {
    return this.groupTransactionService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Request() req, @Query('groupId') groupId?: string) {
    return this.groupTransactionService.findAll(req.user.userId, groupId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.groupTransactionService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateGroupTransactionDto) {
    return this.groupTransactionService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.groupTransactionService.delete(id, req.user.userId);
    return { ok: true };
  }

  @Post(':id/mark-paid')
  async markPaid(@Request() req, @Param('id') id: string) {
    return this.groupTransactionService.markPaid(id, req.user.userId);
  }

  @Post(':id/mark-unpaid')
  async markUnpaid(@Request() req, @Param('id') id: string) {
    return this.groupTransactionService.markUnpaid(id, req.user.userId);
  }
}
