import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import {
  DeleteUserUseCase,
  FindAllUserUseCase,
  FindOneUserUseCase,
  SignUpUserUseCase,
  UpdateUserUseCase
} from '../../application/use-cases/user';
import { FindOneByIdDto } from '../dto/common/find-one-by-id.dto';
import { FindOneUserByIdDto, SignUpUserDto, UpdateUserDto } from '../dto/user';
import { JwtAuthGuard } from '../guards';
import { Public } from '../guards/public';

@Controller('users')
@UseGuards(JwtAuthGuard)
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
  async findAll(@Request() request) {
    try {
      this.logger.debug(`findAll`);

      const { user } = request;
      this.logger.debug(`findAll::user: ${JSON.stringify(user, null, 2)}`);

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
  async findOne(@Param() { id }: FindOneUserByIdDto, @Request() request) {
    try {
      this.logger.debug(`findOne::id: ${id} - request: ${request}`, id);

      const { user } = request;

      if (user.id !== id) {
        throw new Error('You are not allowed to access this resource');
      }

      const foundUser = await this.findOneUserUseCase.execute(id);

      const { password, ...userWithoutPassword } = foundUser;

      return {
        status: true,
        user: userWithoutPassword
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
