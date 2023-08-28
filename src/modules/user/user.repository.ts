import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRepositoryInterface } from './user.repository.interface';

export class UserRepository
  extends Repository<User>
  implements UserRepositoryInterface<User>
{
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner
    );
  }

  private readonly logger = new Logger(UserRepository.name);

  async findOneById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  async findOneByUserName(userName: string): Promise<User> {
    return this.userRepository.findOneBy({ userName });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  async isExist(id: number): Promise<boolean> {
    return this.userRepository.exist({
      where: { id }
    });
  }
}
