// src/contributions/entities/contribution.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Group } from 'src/entities/group.entity';

@Entity()
export class Contribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.contributions)
  user: User;

  @ManyToOne(() => Group, (group) => group.contributions)
  group: Group;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  cycle: number; // E.g., 1st month, 2nd round

  @Column({ default: false })
  confirmed: boolean; // Marked true when payment is verified

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
