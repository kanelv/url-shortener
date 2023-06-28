import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
@Index(['urlCode'], { unique: true })
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  urlCode: string;

  @Column()
  originalUrl: string;

  @Column({ name: 'user_id' })
  public userId: number;

  @ManyToOne(() => User, (user: User) => user.urls, {
    cascade: ['update'],
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'user_id'
  })
  public user: User;

  @CreateDateColumn()
  public createdAt: Date;
}
