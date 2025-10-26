import { Exclude, Expose } from 'class-transformer';

export class ShortLinkEntity {
  @Exclude()
  PK: string; // user#<userId>
  @Exclude()
  SK: string; // shortlink#<shortCode>
  @Expose()
  originalUrl: string;
  @Expose()
  shortCode: string;
  @Expose()
  clicks: number;
  @Exclude()
  expiresAt: number; // UNIX time for DynamoDB TTL
  @Expose()
  status: boolean;
  @Expose()
  createdAt: string; // ISO timestamp
  @Expose()
  updatedAt: string; // ISO timestamp
}
