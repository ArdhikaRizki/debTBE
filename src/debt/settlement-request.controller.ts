import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettlementRequestService } from './settlement-request.service';
import { CreateSettlementRequestDto, ReviewSettlementDto } from './dto/settlement-request.dto';

@Controller('settlement-requests')
@UseGuards(JwtAuthGuard)
export class SettlementRequestController {
  constructor(private readonly settlementRequestService: SettlementRequestService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateSettlementRequestDto) {
    return this.settlementRequestService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('groupId') groupId?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};
    if (groupId) filters.groupId = groupId;
    if (status) filters.status = status;

    return this.settlementRequestService.findAll(req.user.userId, filters);
  }

  @Get('pending')
  async getPending(@Request() req, @Query('groupId') groupId?: string) {
    return this.settlementRequestService.getPendingForUser(req.user.userId, groupId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.settlementRequestService.findOne(id, req.user.userId);
  }

  @Post(':id/review')
  async review(@Request() req, @Param('id') id: string, @Body() dto: ReviewSettlementDto) {
    return this.settlementRequestService.review(id, req.user.userId, dto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.settlementRequestService.delete(id, req.user.userId);
    return { ok: true };
  }
}
