import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FindOneByIdDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  readonly id: number;
}
