// src/users/entities/profile.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({ nullable: true })
  rejectionReason: string; // Optional reason if rejected

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
