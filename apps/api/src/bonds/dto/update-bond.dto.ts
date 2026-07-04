import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBondDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  issuer?: string;

  @IsString()
  @IsOptional()
  isin?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  couponRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  yieldRate?: number;

  @IsString()
  @IsIn(['ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY', 'MONTHLY', 'AT_MATURITY'])
  @IsOptional()
  couponFrequency?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  faceValue?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minInvestment?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxInvestment?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  totalIssuance?: number;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  maturityDate?: string;

  @IsDateString()
  @IsOptional()
  auctionDate?: string;

  @IsDateString()
  @IsOptional()
  subscriptionDeadline?: string;
}
