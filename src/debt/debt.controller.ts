import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { DebtService } from './debt.service';
import { OptimizeDto, SimulateDto, PathDto, ActivityDto } from './dto/debt.dto';

@Controller('debts')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Post('optimize')
  optimize(@Body() body: OptimizeDto) {
    return this.debtService.getOptimizedDebtGraph(body.allDebts || [], body.allUsers || []);
  }

  @Post('simulate')
  simulate(@Body() body: SimulateDto) {
    return this.debtService.simulatePayment(body);
  }

  @Post('path')
  findPath(@Body() body: PathDto) {
    let optimizedDebts = body.optimizedDebts;
    if (!optimizedDebts && body.allDebts && body.allUsers) {
      optimizedDebts = this.debtService.optimizeDebts(
        this.debtService.calculateUserBalances(body.allDebts, body.allUsers)
      );
    }

    if (!optimizedDebts) return { error: 'Provide optimizedDebts or allDebts/allUsers' };

    const found = this.debtService.findDirectPath(body.fromUserId, body.toUserId, optimizedDebts);
    return { path: found };
  }

  @Post('suggestions')
  suggestions(@Body() body: { userId: string; allDebts?: any[]; allUsers?: any[]; optimizedDebts?: any[] }) {
    let optimizedDebts = body.optimizedDebts;
    if (!optimizedDebts && body.allDebts && body.allUsers) {
      optimizedDebts = this.debtService.optimizeDebts(
        this.debtService.calculateUserBalances(body.allDebts, body.allUsers)
      );
    }

    if (!optimizedDebts) return { error: 'Provide optimizedDebts or allDebts/allUsers' };

    return this.debtService.getUserSuggestions(body.userId, optimizedDebts);
  }

  @Get('activities')
  getActivities(@Query('limit') limit?: string) {
    const l = limit ? parseInt(limit, 10) : 10;
    return this.debtService.getRecentActivities(l);
  }

  @Get('activities/:userId')
  getActivitiesForUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const l = limit ? parseInt(limit, 10) : 10;
    return this.debtService.getActivitiesForUser(userId, l);
  }

  @Post('activity')
  addActivity(@Body() body: ActivityDto) {
    return this.debtService.addActivity(body);
  }

  @Delete('activities')
  clearActivities() {
    this.debtService.clearActivities();
    return { ok: true };
  }
}
