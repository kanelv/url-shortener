import { DynamicModule, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  CreateShortLinkUseCase,
  DeactivateShortLinkUseCase,
  DeleteShortLinkUseCase,
  ExtendShortLinkExpiryUseCase,
  FindAllShortLinkUseCase,
  FindOneShortLinkUseCase,
  RedirectShortLinkUseCase
} from '../../application/use-cases/shortlink';
import { ActivateShortLinkUseCase } from '../../application/use-cases/shortlink/activate-shortlink.usecase';
import {
  DeleteUserUseCase,
  FindAllUserUseCase,
  FindOneUserUseCase,
  SignInUserUseCase,
  SignUpUserUseCase,
  UpdateUserUseCase
} from '../../application/use-cases/user';
import {
  AbstractShortLinkRepository,
  AbstractUserRepository
} from '../../domain/contracts/repositories';
import { AbstractBcryptService } from '../../domain/services';
import { RepositoriesModule } from '../../ia/repositories/repositories.module';
import { BcryptModule } from '../services/bcrypt/bcrypt.module';

@Module({
  imports: [BcryptModule, RepositoriesModule]
})
export class UseCasesProxyModule {
  static register(): DynamicModule {
    return {
      module: UseCasesProxyModule,
      providers: [
        /**
         * User Management
         */
        {
          inject: [AbstractUserRepository, AbstractBcryptService],
          provide: SignUpUserUseCase,
          useFactory: (
            userRepository: AbstractUserRepository,
            bcryptService: AbstractBcryptService
          ) => new SignUpUserUseCase(userRepository, bcryptService)
        },
        {
          inject: [AbstractUserRepository, AbstractBcryptService, JwtService],
          provide: SignInUserUseCase,
          useFactory: (
            userRepository: AbstractUserRepository,
            bcryptService: AbstractBcryptService,
            jwtService: JwtService
          ) => new SignInUserUseCase(userRepository, bcryptService, jwtService)
        },
        {
          inject: [AbstractUserRepository],
          provide: FindAllUserUseCase,
          useFactory: (userRepository: AbstractUserRepository) =>
            new FindAllUserUseCase(userRepository)
        },
        {
          inject: [AbstractUserRepository],
          provide: FindOneUserUseCase,
          useFactory: (userRepository: AbstractUserRepository) =>
            new FindOneUserUseCase(userRepository)
        },
        {
          inject: [AbstractUserRepository, AbstractBcryptService],
          provide: UpdateUserUseCase,
          useFactory: (
            userRepository: AbstractUserRepository,
            bcryptService: AbstractBcryptService
          ) => new UpdateUserUseCase(userRepository, bcryptService)
        },
        {
          inject: [AbstractUserRepository],
          provide: DeleteUserUseCase,
          useFactory: (userRepository: AbstractUserRepository) =>
            new DeleteUserUseCase(userRepository)
        },
        /**
         * ShortLink Management
         */
        {
          inject: [AbstractShortLinkRepository],
          provide: CreateShortLinkUseCase,
          useFactory: (urlRepository: AbstractShortLinkRepository) =>
            new CreateShortLinkUseCase(urlRepository)
        },
        {
          inject: [AbstractShortLinkRepository],
          provide: FindAllShortLinkUseCase,
          useFactory: (urlRepository: AbstractShortLinkRepository) =>
            new FindAllShortLinkUseCase(urlRepository)
        },
        {
          inject: [AbstractShortLinkRepository],
          provide: FindOneShortLinkUseCase,
          useFactory: (urlRepository: AbstractShortLinkRepository) =>
            new FindOneShortLinkUseCase(urlRepository)
        },
        {
          inject: [AbstractShortLinkRepository],
          provide: ExtendShortLinkExpiryUseCase,
          useFactory: (urlRepository: AbstractShortLinkRepository) =>
            new ExtendShortLinkExpiryUseCase(urlRepository)
        },
        {
          inject: [AbstractShortLinkRepository],
          provide: ActivateShortLinkUseCase,
          useFactory: (urlRepository: AbstractShortLinkRepository) =>
            new ActivateShortLinkUseCase(urlRepository)
        },
        {
          inject: [AbstractShortLinkRepository],
          provide: DeactivateShortLinkUseCase,
          useFactory: (urlRepository: AbstractShortLinkRepository) =>
            new DeactivateShortLinkUseCase(urlRepository)
        },
        {
          inject: [AbstractShortLinkRepository],
          provide: DeleteShortLinkUseCase,
          useFactory: (urlRepository: AbstractShortLinkRepository) =>
            new DeleteShortLinkUseCase(urlRepository)
        },
        {
          inject: [AbstractShortLinkRepository],
          provide: RedirectShortLinkUseCase,
          useFactory: (urlRepository: AbstractShortLinkRepository) =>
            new RedirectShortLinkUseCase(urlRepository)
        }
      ],
      exports: [
        SignUpUserUseCase,
        SignInUserUseCase,
        FindAllUserUseCase,
        FindOneUserUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
        CreateShortLinkUseCase,
        FindAllShortLinkUseCase,
        FindOneShortLinkUseCase,
        ExtendShortLinkExpiryUseCase,
        ActivateShortLinkUseCase,
        DeactivateShortLinkUseCase,
        DeleteShortLinkUseCase,
        RedirectShortLinkUseCase
      ]
    };
  }
}
