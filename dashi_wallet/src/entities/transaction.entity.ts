// src/transactions/entities/transaction.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: 'deposit' | 'contribution' | 'withdrawal' | 'payout';

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: 'pending' | 'successful' | 'failed';

  @Column({ nullable: true })
  ref: string; // tx_ref or transaction_id from Flutterwave

  @Column({ nullable: true })
  description: string;

  @Column()
  email: string;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
