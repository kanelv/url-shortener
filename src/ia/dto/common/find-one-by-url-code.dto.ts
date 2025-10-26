import { IsNotEmpty, IsString } from 'class-validator';

export class FindOneByCodeDto {
  @IsString()
  @IsNotEmpty()
  readonly code: string;
}
