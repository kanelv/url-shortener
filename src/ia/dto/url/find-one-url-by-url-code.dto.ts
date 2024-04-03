import { IsNotEmpty, IsString } from 'class-validator';

export class FindOneUrlByUrlCodeDto {
  @IsString()
  @IsNotEmpty()
  urlCode: string;
}
