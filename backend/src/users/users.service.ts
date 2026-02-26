import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, isActive: true, createdAt: true, doctor: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: { email: string; password: string; role: Role }) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');
    const password = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { ...dto, password },
      select: { id: true, email: true, role: true, isActive: true, createdAt: true },
    });
  }

  async findAll2() {
    return { data: [] };
  }
}
