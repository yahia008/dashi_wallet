import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.createdGroups)
  createdBy: User; // Must be an agent

  @Column('decimal', { precision: 10, scale: 2 })
  contributionAmount: number;

  @Column()
  frequency: 'daily' | 'weekly' | 'monthly';

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: 0 })
  currentCycle: number;

  @Column('text', { nullable: true })
  rules: string;

  @Column({ default: 'active' })
  status: 'active' | 'completed' | 'cancelled';

  @ManyToMany(() => User)
  @JoinTable()
  members: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
