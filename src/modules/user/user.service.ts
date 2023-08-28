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

    const { password, userName } = createUserDto;

    const exist = await this.userRepository.exist({ where: { userName } });
    if (exist) {
      throw new Error(`Username ${userName} is already exist`);
    }

    const encryptedPassword = hashSync(password, 10);

    const newUser = this.userRepository.create({
      userName,
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

  async findMany(): Promise<OmitProperties<User, 'password'>[]> {
    const users = await this.userRepository.find();
    this.logger.debug(`findMany::users: ${JSON.stringify(users, null, 2)}`);

    const handleUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    this.logger.debug(
      `findMany::handleUsers: ${JSON.stringify(handleUsers, null, 2)}`
    );

    return handleUsers;
  }

  /**
   * Find one user by id
   * @param id
   * @returns
   */
  async findOneById(id: number): Promise<OmitProperties<User, 'password'>> {
    this.logger.debug(`findOneById::id: ${id}`);

    const passiveUser: User = await this.userRepository.findOneById(id);
    this.logger.debug(
      `findOneById::passiveUser: ${JSON.stringify(passiveUser, null, 2)}`
    );

    if (!passiveUser) {
      throw new Error(`User ${id} is not exist`);
    }

    const { password, ...result } = passiveUser;

    return result;
  }

  /**
   *
   * @param userName
   * @returns
   */
  async findOneByUserName(userName: string): Promise<User> {
    this.logger.debug(`findOneByUserName::userName: ${userName}`);

    const passiveUser: User = await this.userRepository.findOneByUserName(
      userName
    );

    this.logger.debug(
      `findOneById::passiveUser: ${JSON.stringify(passiveUser, null, 2)}`
    );

    if (!passiveUser) {
      throw new Error(`User ${userName} is not exist`);
    }

    return passiveUser;
  }

  /**
   *
   * @param email
   * @returns
   */
  async findOneByEmail(
    email: string
  ): Promise<OmitProperties<User, 'password'>> {
    this.logger.debug(`findOneByUserName::userName: ${email}`);

    const passiveUser: User = await this.userRepository.findOneByEmail(email);

    this.logger.debug(
      `findOneById::passiveUser: ${JSON.stringify(passiveUser, null, 2)}`
    );

    if (!passiveUser) {
      throw new Error(`User ${email} is not exist`);
    }

    const { password, ...result } = passiveUser;

    return result;
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
