import { UpdateUserUseCase } from './../../../application/use-cases/user/update-user.usecase';
import { FindOneUserUseCase } from './../../../application/use-cases/user/find-one-user.usecase';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import {
  DeleteUserUseCase,
  SignUpUserUseCase
} from '../../../application/use-cases/user';
import { Public } from '../../common/utils/allow-public-request.util';
import { FindOneByIdDto } from '../dtos/common/find-one-by-id.dto';
import { SignUpUserDto } from '../dtos/user/sign-up-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { FindAllUserUseCase } from './../../../application/use-cases/user/find-all-user.usecase';
import { UseCasesProxyModule } from '../../use-cases-proxy/use-cases-proxy.module';

@Controller('users')
export class UserController {
  constructor(
    @Inject(UseCasesProxyModule.SIGN_UP_USER_USECASE_PROXY)
    private readonly signUpUserUseCase: SignUpUserUseCase,
    @Inject(UseCasesProxyModule.FIND_ALL_USER_USECASE_PROXY)
    private readonly findAllUserUseCase: FindAllUserUseCase,
    @Inject(UseCasesProxyModule.FIND_ONE_USER_USECASE_PROXY)
    private readonly findOneUserUseCase: FindOneUserUseCase,
    @Inject(UseCasesProxyModule.UPDATE_USER_USECASE_PROXY)
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(UseCasesProxyModule.DELETE_USER_USECASE_PROXY)
    private readonly deleteUserUseCase: DeleteUserUseCase
  ) {}

  readonly logger = new Logger(UserController.name);

  @Public()
  @Post()
  async signUp(@Body() signUpUserDto: SignUpUserDto) {
    try {
      this.logger.debug('signUp::signUpUserDto: ', signUpUserDto);

      const { userName, password } = signUpUserDto;

      return this.signUpUserUseCase.execute(userName, password);
    } catch (error) {
      this.logger.error('create::error', error);

      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      this.logger.debug('findAll');

      const users = await this.findAllUserUseCase.execute();

      return {
        status: true,
        users
      };
    } catch (error) {
      this.logger.error('findAll::error', error);

      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param() { id }: FindOneByIdDto) {
    try {
      this.logger.debug('findOne::id', id);

      const user = await this.findOneUserUseCase.execute(id);

      return {
        status: true,
        user
      };
    } catch (error) {
      this.logger.error('findOne::error', error);

      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param() { id }: FindOneByIdDto,
    @Body() updateUserDto: UpdateUserDto
  ) {
    try {
      this.logger.debug('update::id', id);

      await this.updateUserUseCase.execute(id, updateUserDto);

      return {
        status: true
      };
    } catch (error) {
      this.logger.error('update::error', error);

      throw error;
    }
  }

  @Delete(':id')
  async delete(@Param() { id }: FindOneByIdDto) {
    try {
      this.logger.debug('delete::id', id);

      await this.deleteUserUseCase.execute(id);

      return {
        status: true
      };
    } catch (error) {
      this.logger.error('delete::error', error);

      throw error;
    }
  }
}
