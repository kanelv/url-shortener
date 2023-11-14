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
import {
  AbstractUrlRepository,
  AbstractUserRepository
} from '../../domain/contracts/repositories';
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
          inject: [AbstractUserRepository, BcryptService],
          provide: SignUpUserUseCase,
          useFactory: (
            userRepository: AbstractUserRepository,
            bcryptService: BcryptService
          ) => new SignUpUserUseCase(userRepository, bcryptService)
        },
        {
          inject: [AbstractUserRepository, BcryptService, JwtService],
          provide: SignInUserUseCase,
          useFactory: (
            userRepository: AbstractUserRepository,
            bcryptService: BcryptService,
            jwtService: JwtService
          ) => new SignInUserUseCase(userRepository, bcryptService, jwtService)
        },
        {
          inject: [AbstractUserRepository],
          provide: FindOneUserUseCase,
          useFactory: (userRepository: AbstractUserRepository) =>
            new FindOneUserUseCase(userRepository)
        },
        {
          inject: [AbstractUserRepository],
          provide: FindAllUserUseCase,
          useFactory: (userRepository: AbstractUserRepository) =>
            new FindAllUserUseCase(userRepository)
        },
        {
          inject: [AbstractUserRepository, BcryptService],
          provide: UpdateUserUseCase,
          useFactory: (
            userRepository: AbstractUserRepository,
            bcryptService: BcryptService
          ) => new UpdateUserUseCase(userRepository, bcryptService)
        },
        {
          inject: [AbstractUserRepository],
          provide: DeleteUserUseCase,
          useFactory: (userRepository: AbstractUserRepository) =>
            new DeleteUserUseCase(userRepository)
        },
        {
          inject: [AbstractUrlRepository],
          provide: ShortenUrlUseCase,
          useFactory: (urlRepository: AbstractUrlRepository) =>
            new ShortenUrlUseCase(urlRepository)
        },
        {
          inject: [AbstractUrlRepository],
          provide: FindAllUrlUseCase,
          useFactory: (urlRepository: AbstractUrlRepository) =>
            new FindAllUrlUseCase(urlRepository)
        },
        {
          inject: [AbstractUrlRepository],
          provide: UseCasesProxyModule,
          useFactory: (urlRepository: AbstractUrlRepository) =>
            new RedirectUrlUseCase(urlRepository)
        },
        {
          inject: [AbstractUrlRepository],
          provide: FindOneUrlUseCase,
          useFactory: (urlRepository: AbstractUrlRepository) =>
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
