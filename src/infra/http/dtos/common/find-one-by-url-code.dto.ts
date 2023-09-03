import { IsNotEmpty, IsString } from 'class-validator';

export class FindOneByUrlCodeDto {
  @IsString()
  @IsNotEmpty()
  readonly code: string;
}
