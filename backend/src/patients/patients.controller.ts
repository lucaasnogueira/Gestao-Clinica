import {
  Controller, Get, Post, Put, Delete, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar pacientes com paginação e filtros' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.patientsService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Busca rápida por nome, CPF ou telefone' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') q: string) {
    return this.patientsService.search(q);
  }

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Cadastrar novo paciente' })
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Atualizar cadastro do paciente' })
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar paciente (soft delete)' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }

  @Get(':id/appointments')
  @ApiOperation({ summary: 'Histórico de consultas do paciente' })
  getAppointments(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.patientsService.getAppointments(id, query);
  }

  @Get(':id/medical-records')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Prontuários do paciente' })
  getMedicalRecords(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.patientsService.getMedicalRecords(id, query);
  }

  @Get(':id/bills')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Faturas do paciente' })
  getBills(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.patientsService.getBills(id, query);
  }
}
