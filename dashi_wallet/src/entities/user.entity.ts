// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Profile } from 'src/entities/profile.entity';
import { Group } from './group.entity';
import { Transaction } from './transaction.entity';
import { Contribution } from './contribution.entitz';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column()
  photo: string;

@Column({ type: 'text', nullable: true })
resetToken: string | null;

 @Column({ type: 'timestamp', nullable: true })
tokenExpires: Date | null;

  @Column({
    type: 'enum',
    enum: ['agent', 'admin', 'user'],
    default: 'user',
  })
  role: 'agent' | 'admin' | 'user';

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  blance: number;

  @OneToMany(() => Group, (group) => group.createdBy)
  createdGroups: Group[];

  @ManyToMany(() => Group, (group) => group.members)
  joinedGroups: Group[];

  @OneToOne(() => Profile, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  profile: Profile;
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Contribution, (contribution) => contribution.user)
  contributions: Contribution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
