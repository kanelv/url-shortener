import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { IUserRepository } from '../../../domain/contracts/repositories/user.repository.interface';
import { User as UserEntity } from '../../../domain/entities/user.entity';
import { User } from '../entities/user.entity';

export class UserRepository
  extends Repository<User>
  implements IUserRepository
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner
    );
  }

  private readonly logger = new Logger(UserRepository.name);

  async add(userName: string, password: string): Promise<any> {
    const newUser = this.userRepository.create({
      userName,
      password: password
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

  async findAll(): Promise<any[]> {
    const users: User[] = await this.userRepository.find();
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

  async findOneById(id: number): Promise<any> {
    this.logger.debug(`findOneById::id: ${id}`);

    const passiveUser: User = await this.userRepository.findOneBy({ id });

    this.logger.debug(
      `findOneById::passiveUser: ${JSON.stringify(passiveUser, null, 2)}`
    );

    if (!passiveUser) {
      throw new Error(`User ${id} is not exist`);
    }

    const { password, createdAt, updatedAt, ...result } = passiveUser;

    return result;
  }

  async findOneByUserName(userName: string): Promise<any> {
    return this.userRepository.findOneBy({ userName });
  }

  async findOneByEmail(email: string): Promise<any> {
    return this.userRepository.findOneBy({ email });
  }

  async updateOne(
    id: number,
    updateUser: Partial<Omit<UserEntity, 'urls'>>
  ): Promise<boolean> {
    const updateResult: UpdateResult = await this.userRepository.update(
      id,
      updateUser
    );
    this.logger.debug(`update::updateResult: ${JSON.stringify(updateResult)}`);

    if (updateResult && updateResult.affected == 1) {
      return true;
    } else {
      return false;
    }
  }

  async deleteOne(id: number): Promise<boolean> {
    this.logger.debug(`deleteOne::id: ${id}`);
    const deleteResult: DeleteResult = await this.userRepository.delete(id);
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
