import { DynamicModule, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  FindAllUrlUseCase,
  FindOneUrlUseCase,
  RedirectUrlUseCase,
  ShortenUrlUseCase
} from '../../application/use-cases/url';
import {
  DeleteUserUseCase,
  FindAllUserUseCase,
  FindOneUserUseCase,
  SignInUserUseCase,
  SignUpUserUseCase,
  UpdateUserUseCase
} from '../../application/use-cases/user';
import { UrlRepository, UserRepository } from '../database/repositories';
import { RepositoriesModule } from '../database/repositories/repositories.module';
import { BcryptModule } from '../services/bcrypt/bcrypt.module';
import { BcryptService } from '../services/bcrypt/bcrypt.service';

@Module({
  imports: [BcryptModule, RepositoriesModule]
})
export class UseCasesProxyModule {
  static register(): DynamicModule {
    return {
      module: UseCasesProxyModule,
      providers: [
        {
          inject: [UserRepository, BcryptService],
          provide: SignUpUserUseCase,
          useFactory: (
            userRepository: UserRepository,
            bcryptService: BcryptService
          ) => new SignUpUserUseCase(userRepository, bcryptService)
        },
        {
          inject: [UserRepository, BcryptService, JwtService],
          provide: SignInUserUseCase,
          useFactory: (
            userRepository: UserRepository,
            bcryptService: BcryptService,
            jwtService: JwtService
          ) => new SignInUserUseCase(userRepository, bcryptService, jwtService)
        },
        {
          inject: [UserRepository],
          provide: FindOneUserUseCase,
          useFactory: (userRepository: UserRepository) =>
            new FindOneUserUseCase(userRepository)
        },
        {
          inject: [UserRepository],
          provide: FindAllUserUseCase,
          useFactory: (userRepository: UserRepository) =>
            new FindAllUserUseCase(userRepository)
        },
        {
          inject: [UserRepository, BcryptService],
          provide: UpdateUserUseCase,
          useFactory: (
            userRepository: UserRepository,
            bcryptService: BcryptService
          ) => new UpdateUserUseCase(userRepository, bcryptService)
        },
        {
          inject: [UserRepository],
          provide: DeleteUserUseCase,
          useFactory: (userRepository: UserRepository) =>
            new DeleteUserUseCase(userRepository)
        },
        {
          inject: [UrlRepository],
          provide: ShortenUrlUseCase,
          useFactory: (urlRepository: UrlRepository) =>
            new ShortenUrlUseCase(urlRepository)
        },
        {
          inject: [UrlRepository],
          provide: FindAllUrlUseCase,
          useFactory: (urlRepository: UrlRepository) =>
            new FindAllUrlUseCase(urlRepository)
        },
        {
          inject: [UrlRepository],
          provide: UseCasesProxyModule,
          useFactory: (urlRepository: UrlRepository) =>
            new RedirectUrlUseCase(urlRepository)
        },
        {
          inject: [UrlRepository],
          provide: FindOneUrlUseCase,
          useFactory: (urlRepository: UrlRepository) =>
            new FindOneUrlUseCase(urlRepository)
        }
      ],
      exports: [
        SignUpUserUseCase,
        SignInUserUseCase,
        FindOneUserUseCase,
        FindAllUserUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
        ShortenUrlUseCase,
        FindAllUrlUseCase,
        UseCasesProxyModule,
        FindOneUrlUseCase
      ]
    };
  }
}
