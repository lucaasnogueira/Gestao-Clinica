import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('PatientsService', () => {
  let service: PatientsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    patient: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    medicalRecord: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    bill: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated patients', async () => {
      const mockPatients = [{ id: '1', fullName: 'John Doe' }];
      (prisma.patient.findMany as jest.Mock).mockResolvedValue(mockPatients);
      (prisma.patient.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockPatients);
      expect(result.meta.total).toBe(1);
      expect(prisma.patient.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a patient if found', async () => {
      const mockPatient = { id: '1', fullName: 'John Doe' };
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(mockPatient);

      const result = await service.findOne('1');

      expect(result).toEqual(mockPatient);
    });

    it('should throw NotFoundException if patient not found', async () => {
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a patient if CPF is unique', async () => {
      const dto = { fullName: 'New Patient', cpf: '12345678900' };
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.patient.create as jest.Mock).mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto as any);

      expect(result.id).toBe('1');
      expect(prisma.patient.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if CPF already exists', async () => {
      const dto = { fullName: 'New Patient', cpf: '12345678900' };
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    });
  });
});
