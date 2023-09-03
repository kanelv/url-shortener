import { IsNotEmpty, IsUrl } from 'class-validator';

export class ShortenURLDto {
  @IsUrl()
  @IsNotEmpty()
  originalUrl: string;
}
