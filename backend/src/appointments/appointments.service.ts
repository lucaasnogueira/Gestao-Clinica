import {
  Injectable, NotFoundException, ConflictException, BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, doctorId, status, date, patientId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.scheduledAt = { gte: d, lt: next };
    }

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where, skip, take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          patient: { select: { id: true, fullName: true, phone: true } },
          doctor: { select: { id: true, fullName: true, crm: true } },
          specialty: { select: { name: true } },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { specialties: { include: { specialty: true } } } },
        specialty: true,
        insurance: true,
        medicalRecord: true,
        bill: true,
      },
    });
    if (!appt) throw new NotFoundException(`Agendamento ${id} não encontrado`);
    return appt;
  }

  async create(dto: CreateAppointmentDto) {
    await this.checkConflicts(dto.doctorId, new Date(dto.scheduledAt), new Date(dto.endsAt));

    return this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        specialtyId: dto.specialtyId,
        scheduledAt: new Date(dto.scheduledAt),
        endsAt: new Date(dto.endsAt),
        type: dto.type || 'CONSULTATION',
        notes: dto.notes,
        insuranceId: dto.insuranceId,
      },
      include: {
        patient: { select: { fullName: true, phone: true, email: true } },
        doctor: { select: { fullName: true, crm: true } },
        specialty: { select: { name: true } },
      },
    });
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto) {
    await this.findOne(id);

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.cancellationReason && { cancellationReason: dto.cancellationReason }),
      },
    });
  }

  async update(id: string, dto: Partial<CreateAppointmentDto>) {
    await this.findOne(id);

    if (dto.scheduledAt && dto.endsAt) {
      await this.checkConflicts(
        dto.doctorId!,
        new Date(dto.scheduledAt),
        new Date(dto.endsAt),
        id
      );
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...(dto.scheduledAt && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.endsAt && { endsAt: new Date(dto.endsAt) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.type && { type: dto.type }),
      },
    });
  }

  async cancel(id: string, reason?: string) {
    await this.findOne(id);
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason,
      },
    });
  }

  async getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: today, lt: tomorrow },
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        patient: { select: { fullName: true, phone: true } },
        doctor: { select: { fullName: true } },
        specialty: { select: { name: true } },
      },
    });
  }

  private async checkConflicts(
    doctorId: string,
    scheduledAt: Date,
    endsAt: Date,
    excludeId?: string,
  ) {
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        doctorId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
        OR: [
          { scheduledAt: { gte: scheduledAt, lt: endsAt } },
          { endsAt: { gt: scheduledAt, lte: endsAt } },
          { scheduledAt: { lte: scheduledAt }, endsAt: { gte: endsAt } },
        ],
      },
    });

    if (conflict) throw new ConflictException('Horário já ocupado para este médico');
  }
}
