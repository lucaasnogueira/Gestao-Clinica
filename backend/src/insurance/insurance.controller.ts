import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InsuranceService } from './insurance.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';

@ApiTags('insurance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os convênios' })
  findAll() {
    return this.insuranceService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo convênio' })
  create(@Body() dto: CreateInsuranceDto) {
    return this.insuranceService.create(dto);
  }
}
