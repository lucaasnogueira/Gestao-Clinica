import {
  Controller, Get, Post, Put, Patch, Delete, Body,
  Param, Query, UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos com filtros' })
  findAll(@Query() query: any) {
    return this.appointmentsService.findAll(query);
  }

  @Get('today')
  @ApiOperation({ summary: 'Agenda do dia atual' })
  getToday() {
    return this.appointmentsService.getToday();
  }

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Criar agendamento' })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do agendamento' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Atualizar agendamento' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAppointmentDto>) {
    return this.appointmentsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status do agendamento' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar agendamento' })
  cancel(@Param('id') id: string, @Query('reason') reason?: string) {
    return this.appointmentsService.cancel(id, reason);
  }
}
