import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { hashSync, compareSync } from 'bcryptjs';
import { AbstractBcryptService } from '../../../domain/adapters';

@Injectable()
export class BcryptService implements AbstractBcryptService {
  constructor(private readonly configService: ConfigService) {}

  async hash(hashString: string): Promise<string> {
    const rounds = this.configService.get('BCRYPT_ROUNDS', 10);

    return await hashSync(hashString, rounds);
  }

  async compare(password: string, hashPassword: string): Promise<boolean> {
    return await compareSync(password, hashPassword);
  }
}
