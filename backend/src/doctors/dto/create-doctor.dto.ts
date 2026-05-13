import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  crm: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  crmState: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ default: 30 })
  @IsNumber()
  @IsOptional()
  consultDuration?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  consultPrice: number;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialtyIds?: string[];
}
