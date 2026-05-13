import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    appointment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      patientId: 'p1',
      doctorId: 'd1',
      specialtyId: 's1',
      scheduledAt: '2026-05-12T10:00:00Z',
      endsAt: '2026-05-12T11:00:00Z',
      type: 'CONSULTATION',
    };

    it('should create an appointment if no conflict exists', async () => {
      (prisma.appointment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.appointment.create as jest.Mock).mockResolvedValue({ id: 'a1', ...dto });

      const result = await service.create(dto as any);

      expect(result.id).toBe('a1');
      expect(prisma.appointment.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if there is a scheduling conflict', async () => {
      (prisma.appointment.findFirst as jest.Mock).mockResolvedValue({ id: 'existing' });

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of an appointment', async () => {
      const appt = { id: 'a1', status: 'PENDING' };
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(appt);
      (prisma.appointment.update as jest.Mock).mockResolvedValue({ ...appt, status: 'CONFIRMED' });

      const result = await service.updateStatus('a1', { status: AppointmentStatus.CONFIRMED });

      expect(result.status).toBe('CONFIRMED');
      expect(prisma.appointment.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if appointment does not exist', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateStatus('a1', { status: AppointmentStatus.CONFIRMED }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getToday', () => {
    it('should return appointments for today', async () => {
      const mockAppts = [{ id: 'a1', scheduledAt: new Date() }];
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue(mockAppts);

      const result = await service.getToday();

      expect(result).toEqual(mockAppts);
      expect(prisma.appointment.findMany).toHaveBeenCalled();
    });
  });
});
