import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingQueryDto } from './dto/billing-query.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: BillingQueryDto) {
    const { page = 1, limit = 20, search, status } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.patient = {
        fullName: { contains: search, mode: 'insensitive' },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { dueDate: 'desc' },
        include: {
          patient: { select: { id: true, fullName: true, cpf: true } },
          insurance: { select: { id: true, name: true } },
          appointment: { select: { scheduledAt: true, type: true } },
        },
      }),
      this.prisma.bill.count({ where }),
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
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        patient: true,
        insurance: true,
        appointment: {
          include: {
            doctor: { select: { fullName: true, crm: true } },
          },
        },
      },
    });

    if (!bill) throw new NotFoundException(`Fatura ${id} não encontrada`);
    return bill;
  }

  async registerPayment(id: string, dto: RegisterPaymentDto) {
    const bill = await this.findOne(id);

    if (bill.status === PaymentStatus.PAID) {
      throw new BadRequestException('Esta fatura já está paga');
    }

    return this.prisma.bill.update({
      where: { id },
      data: {
        status: PaymentStatus.PAID,
        paymentMethod: dto.paymentMethod,
        paidAt: new Date(),
        notes: dto.notes,
        // In a real scenario, we might want to check if the amount matches
      },
    });
  }

  async createFromAppointment(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
      },
    });

    if (!appointment) return null;

    // Se já existir uma fatura para este agendamento, não cria outra
    const existing = await this.prisma.bill.findUnique({
      where: { appointmentId },
    });
    if (existing) return existing;

    const amount = appointment.doctor.consultPrice;
    const dueDate = new Date(appointment.scheduledAt);

    return this.prisma.bill.create({
      data: {
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        insuranceId: appointment.insuranceId,
        amount,
        totalAmount: amount, // Sem descontos por enquanto
        status: appointment.insuranceId ? PaymentStatus.PENDING : PaymentStatus.PENDING,
        paymentMethod: appointment.insuranceId ? PaymentMethod.INSURANCE : undefined,
        dueDate,
      },
    });
  }

  async updateStatusFromAppointment(appointmentId: string, status: PaymentStatus) {
    const bill = await this.prisma.bill.findUnique({ where: { appointmentId } });
    if (!bill) return;

    return this.prisma.bill.update({
      where: { id: bill.id },
      data: { status },
    });
  }
}
