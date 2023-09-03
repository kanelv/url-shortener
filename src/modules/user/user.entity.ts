import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Url } from '../url/url.entity';
import { Role } from '../../domain/entities/enums';

@Entity()
@Index(['userName'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userName: string;

  @Column({
    nullable: true
  })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User
  })
  role: Role;

  @Column({
    default: true
  })
  public isActive: boolean;

  @OneToMany(() => Url, (url: Url) => url.user, { cascade: true })
  urls?: Url[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
