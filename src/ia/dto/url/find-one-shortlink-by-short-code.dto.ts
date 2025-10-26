import { IsNotEmpty, IsString } from 'class-validator';

export class FindOneShortLinkByShortCodeDto {
  @IsString()
  @IsNotEmpty()
  readonly shortCode: string;
}
