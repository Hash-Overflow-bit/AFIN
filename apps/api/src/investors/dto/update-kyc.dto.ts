import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class UpdateKycDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['APPROVED', 'REJECTED', 'REQUEST_INFO'])
  status: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
