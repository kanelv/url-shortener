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

      return this.signUpUserUseCase.execute(signUpUserDto);
    } catch (error) {
      this.logger.error('create::error', error);

      throw error;
    }
  }

  // TODO need to be response for only admin
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

  // TODO need to be response for a specific user or admin
  @Get(':id')
  async findOne(
    @Param() findOneUserByIdDto: FindOneUserByIdDto,
    @Request() request
  ) {
    try {
      this.logger.debug(`findOne::findOneUserByIdDto: ${findOneUserByIdDto}`);

      const { user } = request;

      if (user.id !== findOneUserByIdDto.id) {
        throw new Error('You are not allowed to access this resource');
      }

      const foundUser = await this.findOneUserUseCase.execute(
        findOneUserByIdDto
      );

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

  // TODO need to be response for a specific user or admin
  @Patch(':id')
  async update(
    @Param() findOneUserByIdDto: FindOneUserByIdDto,
    @Body() updateUserDto: UpdateUserDto
  ) {
    try {
      this.logger.debug(
        `update::findOneUserByIdDto: ${findOneUserByIdDto} - updateUserDto: ${updateUserDto}`
      );

      await this.updateUserUseCase.execute(findOneUserByIdDto, updateUserDto);

      return {
        status: true
      };
    } catch (error) {
      this.logger.error('update::error', error);

      throw error;
    }
  }

  // TODO need to be response for a specific user or admin
  @Delete(':id')
  async delete(@Param() findOneUserByIdDto: FindOneUserByIdDto) {
    try {
      this.logger.debug(`delete::findOneUserByIdDto: ${findOneUserByIdDto}`);

      await this.deleteUserUseCase.execute(findOneUserByIdDto);

      return {
        status: true
      };
    } catch (error) {
      this.logger.error('delete::error', error);

      throw error;
    }
  }
}
