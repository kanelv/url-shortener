import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindOneByIdDto {
  @IsString()
  @Type(() => String)
  @IsNotEmpty()
  readonly id: string;
}
