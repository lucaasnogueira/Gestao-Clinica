import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpecialtiesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.specialty.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { doctors: true, appointments: true } } },
    });
    return { data };
  }

  async findOne(id: string) {
    const s = await this.prisma.specialty.findUnique({
      where: { id },
      include: { doctors: { include: { doctor: { select: { fullName: true, crm: true } } } } },
    });
    if (!s) throw new NotFoundException(`Especialidade ${id} não encontrada`);
    return s;
  }

  async create(dto: { name: string; description?: string; icon?: string }) {
    const exists = await this.prisma.specialty.findUnique({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Especialidade já cadastrada');
    return this.prisma.specialty.create({ data: dto });
  }

  async update(id: string, dto: Partial<{ name: string; description: string; icon: string; isActive: boolean }>) {
    await this.findOne(id);
    return this.prisma.specialty.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.specialty.update({ where: { id }, data: { isActive: false } });
  }
}
