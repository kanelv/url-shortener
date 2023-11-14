import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import {
  AbstractUserRepository,
  CreateOneUser,
  FindOneUser,
  UpdateOneUser
} from '../../../domain/contracts/repositories';
import { User as UserEntity } from '../../../domain/entities';
import { User } from '../entities';

export class UserRepository implements AbstractUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  private readonly logger = new Logger(UserRepository.name);

  async add(createOneUser: CreateOneUser): Promise<any> {
    const newUser = this.userRepository.create(createOneUser);
    this.logger.debug(`create::newUser: ${JSON.stringify(newUser, null, 2)}`);

    const insertResult: InsertResult = await this.userRepository.insert(
      newUser
    );
    this.logger.debug(
      `create::insertResult: ${JSON.stringify(insertResult, null, 2)}`
    );

    return insertResult.identifiers[0];
  }

  async findAll(): Promise<any[]> {
    const users: User[] = await this.userRepository.find();
    this.logger.debug(`findAll::users: ${JSON.stringify(users, null, 2)}`);

    const handledUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    this.logger.debug(
      `findAll::handledUsers: ${JSON.stringify(handledUsers, null, 2)}`
    );

    return handledUsers;
  }

  async findOne(findOneUser: FindOneUser): Promise<any> {
    this.logger.debug(
      `findOne::findOneUser: ${JSON.stringify(findOneUser, null, 2)}`
    );

    const passiveUser: User = await this.userRepository.findOne({
      where: findOneUser
    });

    this.logger.debug(
      `findOne::passiveUser: ${JSON.stringify(passiveUser, null, 2)}`
    );

    if (!passiveUser) {
      throw new Error(`Not found User has ${findOneUser}`);
    }

    const { createdAt, updatedAt, ...result } = passiveUser;

    return result;
  }

  async updateOne({
    findOneUser,
    updateUser
  }: UpdateOneUser): Promise<boolean> {
    const updateResult: UpdateResult = await this.userRepository.update(
      findOneUser,
      updateUser
    );
    this.logger.debug(`update::updateResult: ${JSON.stringify(updateResult)}`);

    if (updateResult && updateResult.affected == 1) {
      return true;
    } else {
      return false;
    }
  }

  async deleteOne(findOneUser: FindOneUser): Promise<boolean> {
    this.logger.debug(`deleteOne::findOneUser: ${findOneUser}`);
    const deleteResult: DeleteResult = await this.userRepository.delete(
      findOneUser
    );
    this.logger.debug(`delete::deleteResult: ${JSON.stringify(deleteResult)}`);

    if (deleteResult && deleteResult.affected) {
      return true;
    } else {
      return false;
    }
  }

  async isExist(
    conditions: Partial<Omit<UserEntity, 'urls'> & { id: number }>
  ): Promise<boolean> {
    return this.userRepository.exist({
      where: conditions
    });
  }
}
