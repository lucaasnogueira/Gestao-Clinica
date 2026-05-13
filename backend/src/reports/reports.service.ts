import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalsService } from '../goals/goals.service';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private goalsService: GoalsService,
  ) {}

  async getStats() {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [
      totalPatients,
      todayAppts,
      monthlyRevenue,
      totalPatientsWithMultipleAppts,
    ] = await Promise.all([
      this.prisma.patient.count({ where: { isActive: true } }),
      this.prisma.appointment.count({
        where: {
          scheduledAt: { gte: todayStart, lte: todayEnd },
          status: { not: 'CANCELLED' },
        },
      }),
      this.prisma.bill.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: 'PAID',
          paidAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      this.prisma.patient.count({
        where: {
          appointments: {
            some: {},
          },
        },
      }),
    ]);

    // Simple return rate logic: patients who had at least one appointment before and are coming back
    // Or more precisely: patients with more than 1 appointment
    const patientsWithMoreThanOne = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count FROM (
        SELECT "patientId" FROM appointments
        GROUP BY "patientId"
        HAVING COUNT(*) > 1
      ) as sub
    `;
    const returnRateCount = Number((patientsWithMoreThanOne as any)[0].count);
    const returnRate = totalPatients > 0 ? (returnRateCount / totalPatients) * 100 : 0;

    // Goals for current month
    const monthStr = now.toISOString().substring(0, 7); // YYYY-MM
    const { data: goals } = await this.goalsService.findByMonth(monthStr);

    // Current month progress for goals
    const [
      newPatientsThisMonth,
      apptsThisMonth,
    ] = await Promise.all([
      this.prisma.patient.count({
        where: { createdAt: { gte: monthStart, lte: monthEnd } },
      }),
      this.prisma.appointment.count({
        where: {
          scheduledAt: { gte: monthStart, lte: monthEnd },
          status: 'COMPLETED',
        },
      }),
    ]);

    const revenueValue = Number(monthlyRevenue._sum.totalAmount || 0);

    // Volume of appointments (last 7 days)
    const sevenDaysAgo = startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    const volumeData = await this.prisma.$queryRaw`
      SELECT 
        TO_CHAR("scheduledAt", 'DD/MM') as date,
        COUNT(*)::int as count
      FROM appointments
      WHERE "scheduledAt" >= ${sevenDaysAgo}
      GROUP BY date
      ORDER BY MIN("scheduledAt") ASC
    `;

    // Specialties distribution
    const specialtyData = await this.prisma.$queryRaw`
      SELECT 
        s.name as name,
        COUNT(a.id)::int as value
      FROM appointments a
      JOIN specialties s ON a."specialtyId" = s.id
      GROUP BY s.name
      ORDER BY value DESC
      LIMIT 5
    `;

    const goalsWithProgress = goals.map(g => {
      let current = 0;
      if (g.type === 'PATIENTS') current = newPatientsThisMonth;
      if (g.type === 'REVENUE') current = revenueValue;
      if (g.type === 'APPOINTMENTS') current = apptsThisMonth;
      
      return {
        ...g,
        currentValue: current,
        percentage: g.targetValue > 0 ? (current / g.targetValue) * 100 : 0,
      };
    });

    return {
      stats: {
        totalPatients,
        todayAppts,
        monthlyRevenue: revenueValue,
        returnRate: Math.round(returnRate),
      },
      goals: goalsWithProgress,
      charts: {
        volume: volumeData,
        specialties: specialtyData,
      },
    };
  }

  async findAll() {
    return this.getStats();
  }
}
