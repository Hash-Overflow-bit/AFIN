import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  bondId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  requestedAmount: number;
}
