import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Index(['urlCode'], { unique: true })
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  urlCode: string;

  @Column()
  originalUrl: string;

  @Column({
    default: 0
  })
  clicks: number;

  @Column({
    default: true
  })
  status: boolean;

  @Column()
  expiredAt: Date;

  @Column({ name: 'user_id', nullable: true })
  public userId?: number;

  @ManyToOne(() => User, (user: User) => user.urls, {
    cascade: ['update'],
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'user_id'
  })
  public user?: User;

  @CreateDateColumn()
  public createdAt: Date;
}
