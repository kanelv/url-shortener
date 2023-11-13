import { IsNotEmpty, IsString } from 'class-validator';

export class SignInUserDto {
  @IsString()
  @IsNotEmpty()
  readonly userName: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
