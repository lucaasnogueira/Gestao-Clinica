import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, patientId, doctorId, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (search) {
      where.OR = [
        { chiefComplaint: { contains: search, mode: 'insensitive' } },
        { diagnosis: { contains: search, mode: 'insensitive' } },
        { cidCode: { contains: search, mode: 'insensitive' } },
        { patient: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, fullName: true } },
          doctor: { select: { id: true, fullName: true } },
          appointment: { select: { scheduledAt: true, type: true } },
        },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });

    if (!record) throw new NotFoundException(`Prontuário ${id} não encontrado`);
    return record;
  }

  async create(dto: any) {
    try {
      return await this.prisma.medicalRecord.create({
        data: dto,
        include: {
          patient: { select: { fullName: true } },
          doctor: { select: { fullName: true } },
        },
      });
    } catch (error: any) {
      console.error('Erro ao criar prontuário:', error);
      
      // Tratamento específico para erros comuns do Prisma
      if (error.code === 'P2002') {
        throw new BadRequestException('Já existe um prontuário vinculado a este agendamento.');
      }
      
      if (error.code === 'P2003') {
        throw new BadRequestException('Paciente, médico ou agendamento não encontrado (Erro de chave estrangeira).');
      }

      throw new BadRequestException(`Erro ao salvar prontuário: ${error.message}`);
    }
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.medicalRecord.update({
      where: { id },
      data: dto,
      include: {
        patient: { select: { fullName: true } },
        doctor: { select: { fullName: true } },
      },
    });
  }
}
