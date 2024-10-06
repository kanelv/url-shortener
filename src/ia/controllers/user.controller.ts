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
import { Public } from '../guards/public.decorator';

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
    this.logger.debug(
      `signUp::signUpUserDto: ${JSON.stringify(signUpUserDto, null, 2)}`
    );

    return {
      data: await this.signUpUserUseCase.execute(signUpUserDto)
    };
  }

  // TODO need to be response for only admin
  @Get()
  async findAll(@Request() request) {
    this.logger.debug(`findAll`);

    const { user } = request;
    this.logger.debug(`findAll::user: ${JSON.stringify(user, null, 2)}`);

    return {
      data: await this.findAllUserUseCase.execute()
    };
  }

  // TODO need to be response for a specific user or admin
  @Get(':id')
  async findOne(
    @Param() findOneUserByIdDto: FindOneUserByIdDto,
    @Request() request
  ) {
    this.logger.debug(
      `findOne::findOneUserByIdDto: ${JSON.stringify(
        findOneUserByIdDto,
        null,
        2
      )}`
    );

    // TODO: these commented commands below is to consider result by role
    // const { user } = request;

    // if (user.id !== findOneUserByIdDto.id) {
    //   throw new Error('You are not allowed to access this resource');
    // }

    return {
      data: await this.findOneUserUseCase.execute(findOneUserByIdDto)
    };
  }

  // TODO need to be response for a specific user or admin
  @Patch(':id')
  async update(
    @Param() findOneUserByIdDto: FindOneUserByIdDto,
    @Body() updateUserDto: UpdateUserDto
  ) {
    this.logger.debug(
      `update::findOneUserByIdDto: ${JSON.stringify(
        findOneUserByIdDto,
        null,
        2
      )} - updateUserDto: ${JSON.stringify(updateUserDto, null, 2)}`
    );

    return {
      data: await this.updateUserUseCase.execute(
        findOneUserByIdDto,
        updateUserDto
      )
    };
  }

  // TODO need to be response for a specific user or admin
  @Delete(':id')
  async delete(@Param() findOneUserByIdDto: FindOneUserByIdDto) {
    this.logger.debug(
      `delete::findOneUserByIdDto: ${JSON.stringify(
        findOneUserByIdDto,
        null,
        2
      )}`
    );

    return {
      data: await this.deleteUserUseCase.execute(findOneUserByIdDto)
    };
  }
}
