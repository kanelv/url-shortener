import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../domain/entities/enums';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly userName: string;

  @IsString()
  @IsOptional()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly password: string;

  @IsEnum(Role)
  @IsOptional()
  readonly role: Role;

  @IsBoolean()
  @IsOptional()
  readonly isActive: boolean;
}
