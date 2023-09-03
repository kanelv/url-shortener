import { UpdateUserUseCase } from './../../../application/use-cases/user/update-user.usecase';
import { FindOneUserUseCase } from './../../../application/use-cases/user/find-one-user.usecase';
import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('users')
export class UserController {
  constructor(
    private readonly signUpUserUseCase: SignUpUserUseCase,
    private readonly findAllUserUseCase: FindAllUserUseCase,
    private readonly findOneUserUseCase: FindOneUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase
  ) {}

  readonly logger = new Logger(UserController.name);

  @Public()
  @Post('sign-up')
  async signUp(@Body() signUpUserDto: SignUpUserDto) {
    try {
      this.logger.debug(`signUp`);

      return this.signUpUserUseCase.execute(signUpUserDto);
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
