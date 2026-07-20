import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateEmploymentVerificationDto {
  @IsString()
  @IsNotEmpty()
  employerName: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsEmail()
  @IsNotEmpty()
  employerEmail: string;

  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;
}
