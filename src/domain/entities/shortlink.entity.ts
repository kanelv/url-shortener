import { Exclude, Expose } from 'class-transformer';

export class ShortLinkEntity {
  @Expose()
  PK: string; // user#<userId>
  @Expose()
  SK: string; // shortlink#<timestamp><shortCode>
  @Expose()
  GSI1PK: string; // shortcode#$<shortCode>
  @Expose()
  GSI1SK: string; // user#<userId>
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
