import {
  IsString, IsEmail, IsOptional, IsEnum, IsArray,
  IsDateString, IsObject, MinLength, Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, BloodType } from '@prisma/client';

export class CreatePatientDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @MinLength(3)
  fullName: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'CPF inválido. Use formato: 000.000.000-00' })
  cpf: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({ enum: BloodType })
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @ApiProperty({ example: '(11) 99999-9999' })
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneSecondary?: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zip: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronicConditions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
