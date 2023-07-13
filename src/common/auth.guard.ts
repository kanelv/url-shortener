import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { IS_PUBLIC_KEY } from './allow-public-request';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  private readonly logger = new Logger(AuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug(`canActivate`);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const publicKeyPath = path.resolve(
        '',
        this.configService.get('JWT_PUBLIC_KEY')
      );

      this.logger.debug(`canActivate::publicKeyPath: ${publicKeyPath}`);

      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: fs.readFileSync(
          path.resolve('', this.configService.get('JWT_PUBLIC_KEY'))
        )
      });

      payload['id'] = payload.sub;
      delete payload.sub;

      request['user'] = payload;
    } catch (error) {
      this.logger.error(error);

      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
