// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from 'src/entities/profile.entity';

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

  @Column({
    type: 'enum',
    enum: ['agent', 'admin', 'user'],
    default: 'user',
  })
  role: 'agent' | 'admin' | 'user';

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @OneToOne(() => Profile, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  profile: Profile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
