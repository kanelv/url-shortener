import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { FindOneUserUseCase } from '../../application/use-cases/user';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly findOneUserUseCase: FindOneUserUseCase
  ) {}

  private readonly logger = new Logger(BasicAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug(`canActivate`);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    this.logger.debug(`isPublic: ${isPublic}`);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    this.validateAuthorizationHeader(request);

    // extract user and password from authorization header
    const based64Credentials =
      request.headers.authorization.split(' ')[1] || '';
    this.logger.debug(`based64Credentials: ${based64Credentials}`);

    const credentials = Buffer.from(based64Credentials, 'base64').toString();
    this.logger.debug(`credentials: ${credentials}`);

    const [username, password] = credentials.split(':');
    this.logger.debug(`username: ${username}`);
    this.logger.debug(`password: ${password}`);

    if (!username) {
      throw new UnauthorizedException(
        'Authorization header is not in the correct format'
      );
    }

    try {
      const user = await this.findOneUserUseCase.execute({
        username: username
      });

      if (!user || user.password !== password) {
        throw new UnauthorizedException('username or password is incorrect');
      }

      request['user'] = {
        id: user.id,
        username: user.username,
        password: user.password,
        role: user.role
      };
    } catch (error) {
      this.logger.error('error: ', error);

      throw new UnauthorizedException('username or password is incorrect');
    }

    return true;
  }

  private validateAuthorizationHeader(request: Request): void {
    // check if authorization header is set
    if (!request.headers || !request.headers.authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    // check if authorization header is set only once
    if (
      request.headers &&
      request.headers.authorization &&
      Array.isArray(request.headers.authorization)
    ) {
      throw new UnauthorizedException(
        'Authorization header should be set only once in the request'
      );
    }
  }
}
