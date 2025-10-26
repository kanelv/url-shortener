import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindOneShortLinkByIdDto {
  @IsString()
  @Type(() => Number)
  @IsNotEmpty()
  readonly shortCode: string;
}
