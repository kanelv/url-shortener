import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { IUserRepository } from '../../../domain/contracts/repositories/user.repository.interface';
import { User as UserEntity } from '../../../domain/entities/user.entity';
import { User } from '../entities/user.entity';
import { IBcryptService } from '../../../domain/adapters';
import { JwtService } from '@nestjs/jwt';

export class UserRepository
  extends Repository<User>
  implements IUserRepository
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('IBcryptService')
    private readonly bcryptService: IBcryptService,
    private readonly jwtService: JwtService
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner
    );
  }

  private readonly logger = new Logger(UserRepository.name);

  async signUp(userEntity: UserEntity): Promise<any> {
    this.logger.debug(`signUp::user: ${JSON.stringify(userEntity, null, 2)}`);

    const { password, userName } = userEntity;

    const exist = await this.userRepository.exist({ where: { userName } });
    if (exist) {
      throw new Error(`Username ${userName} is already exist`);
    }

    const encryptedPassword = await this.bcryptService.hash(password);

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

  async signIn(userEntity: UserEntity): Promise<any> {
    this.logger.debug(
      `signIn::userEntity: ${JSON.stringify(userEntity, null, 2)}`
    );

    const { userName, password: pass } = userEntity;

    const user = await this.findOneByUserName(userName);

    this.logger.debug(`signIn::user: ${JSON.stringify(user, null, 2)}`);
    this.logger.debug(
      `signIn::compareSync(pass, user.password): ${this.bcryptService.compare(
        pass,
        user.password
      )}`
    );

    if (
      !user ||
      !this.bcryptService.compare(pass, user.password) ||
      !user.isActive
    ) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.id,
      userName: user.userName,
      email: user.email
    };
    this.logger.debug(`signIn::payload: ${JSON.stringify(payload, null, 2)}`);

    return this.jwtService.sign(payload);
  }

  async findAll(): Promise<any[]> {
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

  async updateOne(id: number, user: UserEntity): Promise<boolean> {
    this.logger.debug(
      `update::id: ${id} - userEntity: ${JSON.stringify(user, null, 2)}`
    );

    const isExist = await this.isExist(id);

    if (isExist) {
      const { password, ...remainUserDetail } = user;
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

  async deleteOne(id: number): Promise<boolean> {
    this.logger.debug(`deleteOne::id: ${id}`);

    const isExist = await this.isExist(id);

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
  async isExist(id: number): Promise<boolean> {
    return this.userRepository.exist({
      where: { id }
    });
  }
}
