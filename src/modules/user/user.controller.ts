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
import { Public } from '../../common/allow-public-request';
import { FindOneByIdDto } from '../../infra/http/dtos/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  readonly logger = new Logger(UserController.name);

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      this.logger.debug(`shortenUrl`);

      return this.userService.create(createUserDto);
    } catch (error) {
      this.logger.error('create::error', error);

      throw error;
    }
  }

  @Get()
  async findMany() {
    try {
      this.logger.debug('findMany');

      const users = await this.userService.findMany();

      return {
        status: true,
        users
      };
    } catch (error) {
      this.logger.error('findMany::error', error);

      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param() { id }: FindOneByIdDto) {
    try {
      this.logger.debug('findOne::id', id);

      const user = await this.userService.findOneById(id);

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
      this.logger.debug('findOne::id', id);

      await this.userService.update(id, updateUserDto);

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
      this.logger.debug('findOne::id', id);

      await this.userService.delete(id);

      return {
        status: true
      };
    } catch (error) {
      this.logger.error('delete::error', error);

      throw error;
    }
  }
}
