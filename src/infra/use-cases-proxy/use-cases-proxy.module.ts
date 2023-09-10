import { DynamicModule, Module } from '@nestjs/common';
import {
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
import { RepositoriesModule } from '../database/repositories/repositories.module';
import { UrlRepository } from '../database/repositories/url.repository';
import { UserRepository } from '../database/repositories/user.repository';
import { BcryptModule } from '../services/bcrypt/bcrypt.module';

@Module({
  imports: [BcryptModule, RepositoriesModule]
})
export class UseCasesProxyModule {
  // User
  static SIGN_UP_USER_USECASE_PROXY = 'SignUpUserUseCaseProxy';
  static SIGN_IN_USER_USECASE_PROXY = 'SignInUserUseCaseProxy';
  static FIND_ONE_USER_USECASE_PROXY = 'FindOneUserUseCaseProxy';
  static FIND_ALL_USER_USECASE_PROXY = 'FindAllUserUseCaseProxy';
  static UPDATE_USER_USECASE_PROXY = 'UpdateUserUseCaseProxy';
  static DELETE_USER_USECASE_PROXY = 'DeleteUserUseCaseProxy';

  // Url
  static SHORTEN_URL_USECASES_PROXY = 'ShortenUrlUseCaseProxy';
  static REDIRECT_URL_USECASES_PROXY = 'RedirectUrlUseCaseProxy';

  static register(): DynamicModule {
    return {
      module: UseCasesProxyModule,
      providers: [
        {
          inject: [UserRepository],
          provide: UseCasesProxyModule.SIGN_UP_USER_USECASE_PROXY,
          useFactory: (userRepository: UserRepository) =>
            new SignUpUserUseCase(userRepository)
        },
        {
          inject: [UserRepository],
          provide: UseCasesProxyModule.SIGN_IN_USER_USECASE_PROXY,
          useFactory: (userRepository: UserRepository) =>
            new SignInUserUseCase(userRepository)
        },
        {
          inject: [UserRepository],
          provide: UseCasesProxyModule.FIND_ONE_USER_USECASE_PROXY,
          useFactory: (userRepository: UserRepository) =>
            new FindOneUserUseCase(userRepository)
        },
        {
          inject: [UserRepository],
          provide: UseCasesProxyModule.FIND_ALL_USER_USECASE_PROXY,
          useFactory: (userRepository: UserRepository) =>
            new FindAllUserUseCase(userRepository)
        },
        {
          inject: [UserRepository],
          provide: UseCasesProxyModule.UPDATE_USER_USECASE_PROXY,
          useFactory: (userRepository: UserRepository) =>
            new UpdateUserUseCase(userRepository)
        },
        {
          inject: [UserRepository],
          provide: UseCasesProxyModule.DELETE_USER_USECASE_PROXY,
          useFactory: (userRepository: UserRepository) =>
            new DeleteUserUseCase(userRepository)
        },
        {
          inject: [UrlRepository],
          provide: UseCasesProxyModule.SHORTEN_URL_USECASES_PROXY,
          useFactory: (UrlRepository: UrlRepository) =>
            new ShortenUrlUseCase(UrlRepository)
        },
        {
          inject: [UrlRepository],
          provide: UseCasesProxyModule.REDIRECT_URL_USECASES_PROXY,
          useFactory: (UrlRepository: UrlRepository) =>
            new RedirectUrlUseCase(UrlRepository)
        }
      ],
      exports: [
        UseCasesProxyModule.SIGN_UP_USER_USECASE_PROXY,
        UseCasesProxyModule.SIGN_IN_USER_USECASE_PROXY,
        UseCasesProxyModule.FIND_ONE_USER_USECASE_PROXY,
        UseCasesProxyModule.FIND_ALL_USER_USECASE_PROXY,
        UseCasesProxyModule.UPDATE_USER_USECASE_PROXY,
        UseCasesProxyModule.DELETE_USER_USECASE_PROXY,
        UseCasesProxyModule.SHORTEN_URL_USECASES_PROXY,
        UseCasesProxyModule.REDIRECT_URL_USECASES_PROXY
      ]
    };
  }
}
