import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../domain/entities/enums/role.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly username?: string;

  @IsString()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsEnum(Role)
  @IsOptional()
  readonly role?: Role;

  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;
}
