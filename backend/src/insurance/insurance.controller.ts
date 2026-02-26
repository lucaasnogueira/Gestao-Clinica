import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InsuranceService } from './insurance.service';

@ApiTags('insurance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Get()
  findAll() {
    return this.insuranceService.findAll();
  }
}
