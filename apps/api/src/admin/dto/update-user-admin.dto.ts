import { IsEmail, IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateUserAdminDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @IsIn(['INVESTOR', 'BROKER', 'ADMIN'], { message: 'Role must be INVESTOR, BROKER, or ADMIN' })
  role?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'ACTIVE', 'SUSPENDED'], { message: 'Status must be PENDING, ACTIVE, or SUSPENDED' })
  status?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;
}
