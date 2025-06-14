// src/users/entities/profile.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['bvn', 'national id', 'passport', 'others'],
  })
  identification: 'bvn' | 'national id' | 'passport' | 'others';

  @Column()
  idnumber: string;

  @Column()
  country: string;

  @Column()
  address: string;

  @Column()
  photo: string; // Photo of the ID

  @Column({
    type: 'enum',
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  })
  kycStatus: 'pending' | 'verified' | 'rejected';

  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @Column({ nullable: true })
  rejectionReason: string; // Optional reason if rejected

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
