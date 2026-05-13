import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { search?: string; page?: number; limit?: number }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { crm: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        include: {
          specialties: {
            include: { specialty: true }
          },
          user: {
            select: { email: true, isActive: true }
          }
        },
        orderBy: { fullName: 'asc' },
      }),
      this.prisma.doctor.count({ where }),
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
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        specialties: {
          include: { specialty: true }
        },
        user: {
          select: { email: true, isActive: true }
        },
        schedules: true,
      },
    });

    if (!doctor) throw new NotFoundException('Médico não encontrado');
    return doctor;
  }

  async create(dto: CreateDoctorDto) {
    const crmExists = await this.prisma.doctor.findUnique({
      where: { crm: dto.crm },
    });
    if (crmExists) throw new ConflictException('CRM já cadastrado');

    // Create User first if email provided
    const email = dto.email || `${dto.crm}@gestaoclinica.com.br`;
    const userExists = await this.prisma.user.findUnique({ where: { email } });
    if (userExists) throw new ConflictException('E-mail já cadastrado para outro usuário');

    const hashedPassword = await bcrypt.hash('Mudar@123', 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'DOCTOR',
        }
      });

      const doctor = await tx.doctor.create({
        data: {
          fullName: dto.fullName,
          crm: dto.crm,
          crmState: dto.crmState,
          phone: dto.phone,
          bio: dto.bio,
          consultDuration: dto.consultDuration,
          consultPrice: dto.consultPrice,
          userId: user.id,
          specialties: dto.specialtyIds ? {
            create: dto.specialtyIds.map(id => ({
              specialty: { connect: { id } }
            }))
          } : undefined
        },
        include: {
          specialties: { include: { specialty: true } }
        }
      });

      return doctor;
    });
  }

  async update(id: string, dto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Update User email if changed
      if (dto.email) {
        await tx.user.update({
          where: { id: doctor.userId },
          data: { email: dto.email }
        });
      }

      // Update specialties if provided
      if (dto.specialtyIds) {
        // Remove old ones
        await tx.doctorSpecialty.deleteMany({ where: { doctorId: id } });
        // Add new ones
        await tx.doctorSpecialty.createMany({
          data: dto.specialtyIds.map(sid => ({
            doctorId: id,
            specialtyId: sid
          }))
        });
      }

      return tx.doctor.update({
        where: { id },
        data: {
          fullName: dto.fullName,
          crm: dto.crm,
          crmState: dto.crmState,
          phone: dto.phone,
          bio: dto.bio,
          consultDuration: dto.consultDuration,
          consultPrice: dto.consultPrice,
        },
        include: {
          specialties: { include: { specialty: true } }
        }
      });
    });
  }

  async remove(id: string) {
    const doctor = await this.findOne(id);
    return this.prisma.doctor.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
