import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { BillingQueryDto } from './dto/billing-query.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as faturas' })
  findAll(@Query() query: BillingQueryDto) {
    return this.billingService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma fatura' })
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Registrar pagamento de uma fatura' })
  registerPayment(@Param('id') id: string, @Body() dto: RegisterPaymentDto) {
    return this.billingService.registerPayment(id, dto);
  }
}
