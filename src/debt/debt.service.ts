import { Injectable } from '@nestjs/common';
import {
  UserBalance,
  OptimizedDebt,
  DebtActivity,
  OptimizeDto,
  SimulateDto,
  ActivityDto,
} from './dto/debt.dto';

@Injectable()
export class DebtService {
  private activities: DebtActivity[] = [];

  calculateUserBalances(allDebts: any[], allUsers: any[]): UserBalance[] {
    const balanceMap = new Map<string, UserBalance>();

    allUsers.forEach(user => {
      balanceMap.set(user.id, {
        userId: user.id,
        userName: user.name,
        balance: 0,
      });
    });

    allDebts.forEach(debt => {
      if (debt.isPaid) return;

      const userBalance = balanceMap.get(debt.userId);
      if (!userBalance) return;

      if (debt.type === 'piutang') {
        userBalance.balance += debt.amount;
      } else {
        userBalance.balance -= debt.amount;
      }
    });

    return Array.from(balanceMap.values());
  }

  optimizeDebts(balances: UserBalance[]): OptimizedDebt[] {
    const workingBalances = balances.map(b => ({ ...b }));
    const optimizedDebts: OptimizedDebt[] = [];

    const creditors = workingBalances.filter(b => b.balance > 0.01);
    const debtors = workingBalances.filter(b => b.balance < -0.01);

    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);

    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

      if (amount > 0.01) {
        optimizedDebts.push({
          from: debtor.userId,
          fromName: debtor.userName,
          to: creditor.userId,
          toName: creditor.userName,
          amount: Math.round(amount),
        });

        creditor.balance -= amount;
        debtor.balance += amount;
      }

      if (Math.abs(creditor.balance) < 0.01) i++;
      if (Math.abs(debtor.balance) < 0.01) j++;
    }

    return optimizedDebts;
  }

  getOptimizedDebtGraph(allDebts: any[], allUsers: any[]) {
    const balances = this.calculateUserBalances(allDebts, allUsers);
    const optimizedDebts = this.optimizeDebts(balances);

    const totalAmount = optimizedDebts.reduce((sum, d) => sum + d.amount, 0);

    return {
      balances,
      optimizedDebts,
      totalTransactions: optimizedDebts.length,
      totalAmount,
    };
  }

  findDirectPath(fromUserId: string, toUserId: string, optimizedDebts: OptimizedDebt[]): OptimizedDebt | null {
    return optimizedDebts.find(d => d.from === fromUserId && d.to === toUserId) || null;
  }

  getUserSuggestions(userId: string, optimizedDebts: OptimizedDebt[]) {
    const shouldPay = optimizedDebts.filter(d => d.from === userId);
    const willReceive = optimizedDebts.filter(d => d.to === userId);

    return { shouldPay, willReceive };
  }

  simulatePayment(sim: SimulateDto) {
    const before = this.optimizeDebts(this.calculateUserBalances(sim.allDebts, sim.allUsers));

    const simulatedDebts = [
      ...sim.allDebts,
      {
        id: 'sim',
        userId: sim.fromUserId,
        type: 'piutang',
        name: 'Simulation',
        amount: sim.amount,
        isPaid: false,
      },
      {
        id: 'sim2',
        userId: sim.toUserId,
        type: 'hutang',
        name: 'Simulation',
        amount: sim.amount,
        isPaid: false,
      },
    ];

    const after = this.optimizeDebts(this.calculateUserBalances(simulatedDebts, sim.allUsers));

    const impact =
      before.length > after.length
        ? `Mengurangi ${before.length - after.length} transaksi`
        : before.length === after.length
        ? 'Tidak ada perubahan'
        : 'Menambah transaksi';

    return { before, after, impact };
  }

  // Activity tracker
  addActivity(activity: Omit<ActivityDto, 'id' | 'timestamp'>): DebtActivity {
    const act: DebtActivity = {
      ...activity,
      id: `act${Date.now()}`,
      timestamp: new Date().toISOString(),
    } as DebtActivity;

    this.activities.unshift(act);
    if (this.activities.length > 50) this.activities = this.activities.slice(0, 50);

    return act;
  }

  getRecentActivities(limit = 10): DebtActivity[] {
    return this.activities.slice(0, limit);
  }

  clearActivities(): void {
    this.activities = [];
  }

  getActivitiesForUser(userId: string, limit = 10): DebtActivity[] {
    return this.activities.filter(a => a.from === userId || a.to === userId).slice(0, limit);
  }
}
