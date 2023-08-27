import { Injectable, Logger } from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import {
  DeleteResult,
  InsertResult,
  ObjectLiteral,
  UpdateResult
} from 'typeorm';
import { OmitProperties } from '../../common/type-custom';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private readonly logger = new Logger(UserService.name);

  async create(createUserDto: CreateUserDto): Promise<ObjectLiteral> {
    this.logger.debug(
      `create::createUserDto: ${JSON.stringify(createUserDto, null, 2)}`
    );

    const { password, ...remainUserDetail } = createUserDto;

    const encryptedPassword = hashSync(password, 10);

    const newUser = this.userRepository.create({
      ...remainUserDetail,
      password: encryptedPassword
    });
    this.logger.debug(`create::newUser: ${JSON.stringify(newUser, null, 2)}`);

    const insertResult: InsertResult = await this.userRepository.insert(
      newUser
    );
    this.logger.debug(
      `create::insertResult: ${JSON.stringify(insertResult, null, 2)}`
    );

    return insertResult.identifiers[0];
  }

  async findMany(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOneById(id: number): Promise<OmitProperties<User, 'password'>> {
    this.logger.debug(`findOneById::id: ${id}`);

    const user: User = await this.userRepository.findOneById(id);
    this.logger.debug(`findOneById::user: ${JSON.stringify(user, null, 2)}`);

    const { password, ...result } = user;

    return result;
  }

  async findOneByUserName(userName: string): Promise<User> {
    return this.userRepository.findOneByUserName(userName);
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneByEmail(email);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<boolean> {
    this.logger.debug(
      `update::id: ${id} - updateUserDto: ${JSON.stringify(
        updateUserDto,
        null,
        2
      )}`
    );

    const isExist = await this.userRepository.isExist(id);

    if (isExist) {
      const { password, ...remainUserDetail } = updateUserDto;
      const encryptedPassword = password ? hashSync(password, 10) : null;

      const newUser = encryptedPassword
        ? { password: encryptedPassword, ...remainUserDetail }
        : { ...remainUserDetail };

      const updateResult: UpdateResult = await this.userRepository.update(
        id,
        newUser
      );
      this.logger.debug(
        `update::updateResult: ${JSON.stringify(updateResult)}`
      );

      if (updateResult && updateResult.affected == 1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async delete(id: number): Promise<boolean> {
    this.logger.debug(`delete::id: ${id}`);

    const isExist = await this.userRepository.isExist(id);

    if (isExist) {
      const deleteResult: DeleteResult = await this.userRepository.delete(id);
      this.logger.debug(
        `delete::deleteResult: ${JSON.stringify(deleteResult)}`
      );

      if (deleteResult && deleteResult.affected) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
