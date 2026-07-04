import { IsOptional, IsString, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BondQueryDto {
  @IsString()
  @IsOptional()
  @IsIn(['DRAFT', 'OPEN', 'CLOSED', 'ALLOCATED', 'SETTLED'])
  status?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;
}
