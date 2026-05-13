import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const goals = await this.prisma.goal.findMany({
      orderBy: { month: 'desc' },
    });
    return { data: goals, meta: { total: goals.length } };
  }

  async findByMonth(month: string) {
    const goals = await this.prisma.goal.findMany({
      where: { month },
    });
    return { data: goals };
  }

  async upsert(data: { type: string; month: string; targetValue: number }) {
    return this.prisma.goal.upsert({
      where: {
        type_month: {
          type: data.type,
          month: data.month,
        },
      },
      update: {
        targetValue: data.targetValue,
      },
      create: {
        type: data.type,
        month: data.month,
        targetValue: data.targetValue,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.goal.delete({
      where: { id },
    });
  }
}
