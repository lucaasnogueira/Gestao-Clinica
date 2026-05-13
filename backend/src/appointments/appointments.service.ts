import {
  Injectable, NotFoundException, ConflictException, BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { AppointmentStatus } from '@prisma/client';

import { BillingService } from '../billing/billing.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { doctorId, status, date, patientId } = query;

    const where: any = {};
    if (doctorId && doctorId !== 'undefined') where.doctorId = doctorId;
    if (patientId && patientId !== 'undefined') where.patientId = patientId;
    if (status && status !== 'ALL') where.status = status;
    
    if (date && typeof date === 'string' && date.length >= 10) {
      // Create date at 00:00:00 of the given day
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      
      where.scheduledAt = {
        gte: start,
        lt: end,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          patient: { select: { id: true, fullName: true, phone: true } },
          doctor: { select: { id: true, fullName: true, crm: true } },
          specialty: { select: { name: true } },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

    const appointment = await this.prisma.appointment.create({
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

    // Criar fatura automaticamente
    await this.billingService.createFromAppointment(appointment.id);

    return appointment;
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
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason,
      },
    });

    // Cancelar fatura vinculada
    await this.billingService.updateStatusFromAppointment(id, PaymentStatus.CANCELLED);

    return appointment;
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
