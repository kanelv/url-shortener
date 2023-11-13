import { IsNotEmpty, IsString } from 'class-validator';

export class SignUpUserDto {
  @IsString()
  @IsNotEmpty()
  readonly userName: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
