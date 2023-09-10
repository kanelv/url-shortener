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
import { RepositoriesModule } from '../database/repositories/repositories.module';
import { UrlRepository } from '../database/repositories/url.repository';
import { UserRepository } from '../database/repositories/user.repository';
import { BcryptModule } from '../services/bcrypt/bcrypt.module';
import { BcryptService } from '../services/bcrypt/bcrypt.service';

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
  static FIND_ALL_URL_USECASE_PROXY = 'FindAllUrlUseCaseProxy';
  static FIND_ONE_URL_USECASE_PROXY = 'FindOneUrlUseCaseProxy';

  static register(): DynamicModule {
    return {
      module: UseCasesProxyModule,
      providers: [
        {
          inject: [UserRepository, BcryptService],
          provide: UseCasesProxyModule.SIGN_UP_USER_USECASE_PROXY,
          useFactory: (
            userRepository: UserRepository,
            bcryptService: BcryptService
          ) => new SignUpUserUseCase(userRepository, bcryptService)
        },
        {
          inject: [UserRepository, BcryptService, JwtService],
          provide: UseCasesProxyModule.SIGN_IN_USER_USECASE_PROXY,
          useFactory: (
            userRepository: UserRepository,
            bcryptService: BcryptService,
            jwtService: JwtService
          ) => new SignInUserUseCase(userRepository, bcryptService, jwtService)
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
          inject: [UserRepository, BcryptService],
          provide: UseCasesProxyModule.UPDATE_USER_USECASE_PROXY,
          useFactory: (
            userRepository: UserRepository,
            bcryptService: BcryptService
          ) => new UpdateUserUseCase(userRepository, bcryptService)
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
          useFactory: (urlRepository: UrlRepository) =>
            new ShortenUrlUseCase(urlRepository)
        },
        {
          inject: [UrlRepository],
          provide: UseCasesProxyModule.FIND_ALL_URL_USECASE_PROXY,
          useFactory: (urlRepository: UrlRepository) =>
            new FindAllUrlUseCase(urlRepository)
        },
        {
          inject: [UrlRepository],
          provide: UseCasesProxyModule.REDIRECT_URL_USECASES_PROXY,
          useFactory: (urlRepository: UrlRepository) =>
            new RedirectUrlUseCase(urlRepository)
        },
        {
          inject: [UrlRepository],
          provide: UseCasesProxyModule.FIND_ONE_URL_USECASE_PROXY,
          useFactory: (urlRepository: UrlRepository) =>
            new FindOneUrlUseCase(urlRepository)
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
        UseCasesProxyModule.FIND_ALL_URL_USECASE_PROXY,
        UseCasesProxyModule.REDIRECT_URL_USECASES_PROXY,
        UseCasesProxyModule.FIND_ONE_URL_USECASE_PROXY
      ]
    };
  }
}
