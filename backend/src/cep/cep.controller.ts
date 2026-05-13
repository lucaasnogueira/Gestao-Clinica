import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CepService } from './cep.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('CEP')
@Controller('cep')
@UseGuards(JwtAuthGuard)
export class CepController {
  constructor(private readonly cepService: CepService) {}

  @Get(':cep')
  @ApiOperation({ summary: 'Busca endereço pelo CEP' })
  @ApiResponse({ status: 200, description: 'Endereço encontrado' })
  @ApiResponse({ status: 404, description: 'CEP não encontrado' })
  async getAddress(@Param('cep') cep: string) {
    return this.cepService.fetchAddress(cep);
  }
}
