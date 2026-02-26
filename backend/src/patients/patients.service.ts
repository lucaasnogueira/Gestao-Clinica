import {
  Injectable, NotFoundException, ConflictException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 20, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: isActive !== undefined ? isActive : true,
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { cpf: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
        include: { insurance: { select: { id: true, name: true } } },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        insurance: true,
        _count: {
          select: {
            appointments: true,
            medicalRecords: true,
            bills: true,
          },
        },
      },
    });

    if (!patient) throw new NotFoundException(`Paciente ${id} não encontrado`);
    return patient;
  }

  async create(dto: CreatePatientDto) {
    const exists = await this.prisma.patient.findUnique({ where: { cpf: dto.cpf } });
    if (exists) throw new ConflictException('CPF já cadastrado');

    return this.prisma.patient.create({
      data: dto as any,
      include: { insurance: true },
    });
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id);

    if (dto.cpf) {
      const existing = await this.prisma.patient.findFirst({
        where: { cpf: dto.cpf, NOT: { id } },
      });
      if (existing) throw new ConflictException('CPF já cadastrado para outro paciente');
    }

    return this.prisma.patient.update({
      where: { id },
      data: dto as any,
      include: { insurance: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.patient.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getAppointments(id: string, query: PaginationQueryDto) {
    await this.findOne(id);
    const { page = 1, limit = 20 } = query;

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { patientId: id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
        include: {
          doctor: { select: { fullName: true, crm: true } },
          specialty: { select: { name: true } },
        },
      }),
      this.prisma.appointment.count({ where: { patientId: id } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getMedicalRecords(id: string, query: PaginationQueryDto) {
    await this.findOne(id);
    const { page = 1, limit = 20 } = query;

    const [data, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where: { patientId: id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { doctor: { select: { fullName: true, crm: true } } },
      }),
      this.prisma.medicalRecord.count({ where: { patientId: id } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getBills(id: string, query: PaginationQueryDto) {
    await this.findOne(id);
    const { page = 1, limit = 20 } = query;

    const [data, total] = await Promise.all([
      this.prisma.bill.findMany({
        where: { patientId: id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { insurance: { select: { name: true } } },
      }),
      this.prisma.bill.count({ where: { patientId: id } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async search(q: string) {
    return this.prisma.patient.findMany({
      where: {
        isActive: true,
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { cpf: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: {
        id: true, fullName: true, cpf: true, phone: true, email: true,
        insurance: { select: { name: true } },
      },
    });
  }
}
