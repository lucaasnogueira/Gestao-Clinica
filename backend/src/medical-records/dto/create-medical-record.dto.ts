import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'ID do Paciente' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ description: 'ID do Médico' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ description: 'ID do Agendamento', required: false })
  @IsString()
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({ description: 'Queixa Principal' })
  @IsString()
  @IsNotEmpty()
  chiefComplaint: string;

  @ApiProperty({ description: 'Anamnese', required: false })
  @IsString()
  @IsOptional()
  anamnesis?: string;

  @ApiProperty({ description: 'Exame Físico', required: false })
  @IsString()
  @IsOptional()
  physicalExam?: string;

  @ApiProperty({ description: 'Diagnóstico', required: false })
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiProperty({ description: 'Código CID-10', required: false })
  @IsString()
  @IsOptional()
  cidCode?: string;

  @ApiProperty({ description: 'Conduta', required: false })
  @IsString()
  @IsOptional()
  conduct?: string;

  @ApiProperty({ description: 'Observações', required: false })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiProperty({ description: 'Anexos (URLs)', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @ApiProperty({ description: 'É confidencial?', default: false })
  @IsBoolean()
  @IsOptional()
  isConfidential?: boolean;
}
