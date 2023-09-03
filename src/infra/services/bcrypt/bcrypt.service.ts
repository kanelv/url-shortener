import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { hashSync, compareSync } from 'bcryptjs';
import { IBcryptService } from '../../../domain/adapters/bcrypt.interface';

@Injectable()
export class BcryptService implements IBcryptService {
  constructor(private readonly configService: ConfigService) {}

  async hash(hashString: string): Promise<string> {
    const rounds = this.configService.get('BCRYPT_ROUNDS', 10);

    return await hashSync(hashString, rounds);
  }

  async compare(password: string, hashPassword: string): Promise<boolean> {
    return await compareSync(password, hashPassword);
  }
}
