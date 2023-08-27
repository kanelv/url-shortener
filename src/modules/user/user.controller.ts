import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Request
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  readonly logger = new Logger(UserController.name);

  @Post()
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    try {
      this.logger.debug(`shortenUrl`);

      const user = req;
      this.logger.debug(`shortenUrl::user: ${user}`);

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

      const user = await this.userService.findMany();

      return {
        user
      };
    } catch (error) {
      this.logger.error('findOne::error', error);

      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param() { id }: { id: number }) {
    try {
      this.logger.debug('findOne::id', id);

      const user = await this.userService.findOneById(id);

      return {
        user
      };
    } catch (error) {
      this.logger.error('findOne::error', error);

      throw error;
    }
  }

  @Get(':id')
  async update(
    @Param() { id }: { id: number },
    @Body() updateUserDto: UpdateUserDto
  ) {
    try {
      this.logger.debug('findOne::id', id);

      const user = await this.userService.update(id, updateUserDto);

      return {
        user
      };
    } catch (error) {
      this.logger.error('findOne::error', error);

      throw error;
    }
  }
}
