import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty()
  @IsString()
  doctorId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialtyId?: string;

  @ApiProperty({ example: '2025-03-15T09:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ example: '2025-03-15T09:30:00.000Z' })
  @IsDateString()
  endsAt: string;

  @ApiPropertyOptional({ enum: ['CONSULTATION', 'RETURN', 'EXAM'], default: 'CONSULTATION' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceId?: string;
}
