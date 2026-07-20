import { IsString, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class ReviewEmploymentVerificationDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['APPROVED', 'REJECTED'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
