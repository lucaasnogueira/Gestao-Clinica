import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';

@Injectable()
export class InsuranceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.insurance.findMany({
      orderBy: { name: 'asc' },
    });
    return { data, meta: { total: data.length } };
  }

  async create(dto: CreateInsuranceDto) {
    const exists = await this.prisma.insurance.findUnique({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('Convênio já cadastrado');

    return this.prisma.insurance.create({
      data: dto,
    });
  }

  async findOne(id: string) {
    return this.prisma.insurance.findUnique({ where: { id } });
  }
}
