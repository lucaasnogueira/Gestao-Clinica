import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@ApiTags('medical-records')
@ApiBearerAuth()
@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar prontuários com filtros e paginação' })
  findAll(@Query() query: any) {
    return this.medicalRecordsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um prontuário' })
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova evolução clínica' })
  create(@Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um prontuário existente' })
  update(@Param('id') id: string, @Body() dto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(id, dto);
  }
}
