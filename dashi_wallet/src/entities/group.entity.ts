import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Contribution } from './contribution.entitz';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.createdGroups, { eager: true })
  createdBy: User; // Must be an agent

  @Column('decimal', { precision: 10, scale: 2 })
  contributionAmount: number;

  @Column()
  frequency: 'daily' | 'weekly' | 'monthly';
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  blance: number;


  @Column({ type: 'timestamp' })
startDate: Date;

@Column({ type: 'timestamp' })
endDate: Date;

  @Column({ default: 0 })
  currentCycle: number;

  @Column('text', { nullable: true })
  rules: string;

  @Column({ default: 'active' })
  status: 'active' | 'completed' | 'cancelled';

 @Column({ type: 'text', nullable: true })
inviteToken: string | null;

  @Column({ default: 0 })
  maxMembers: number;

  @Column({ default: 0 })
  totalcycle: number;


  @Column({ type: 'timestamp', nullable: true })
  inviteExpiresAt: Date | null;


  @ManyToMany(() => User)
  @JoinTable()
  members: User[];

  @OneToMany(() => Contribution, (contribution) => contribution.group)
  contributions: Contribution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
