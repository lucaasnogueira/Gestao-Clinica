import { IsString, IsOptional, IsEmail, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInsuranceDto {
  @ApiProperty({ example: 'Unimed Central' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsString()
  @IsOptional()
  ansCode?: string;

  @ApiPropertyOptional({ example: '(11) 4004-0001' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'contato@unimed.com.br' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
