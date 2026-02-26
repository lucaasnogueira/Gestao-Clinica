import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsuranceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return { data: [], meta: { total: 0 } };
  }
}
