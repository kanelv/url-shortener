import { IsNotEmpty, IsUrl } from 'class-validator';

export class ShortenURLDto {
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;
}
