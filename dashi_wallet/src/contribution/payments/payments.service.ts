import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Flutterwave from 'flutterwave-node-v3';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Transaction } from 'src/entities/transaction.entity';

@Injectable()
export class PaymentsService {
  private flw;

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Transaction) private TxRepo: Repository<Transaction>,
  ) {
    this.flw = new Flutterwave(
      process.env.FLW_PUBLIC_KEY,
      process.env.FLW_SECRET_KEY,
    );
  }

  async initiatePayment(
    email: string,
    amount: number,
    tx_ref: string,
    redirect_url: string,
  ) {
    const payload = {
      tx_ref,
      amount,
      currency: 'NGN',
      redirect_url,
      payment_options: 'card,banktransfer',
      customer: {
        email,
      },
      customizations: {
        title: 'Dashi Wallet Deposit',
        description: 'Deposit into wallet',
      },
    };

    try {
      const response = await this.flw.PaymentInitiate(payload);
      return response.data; // contains link
    } catch (error) {
      throw new Error(error.message || 'Flutterwave error');
    }
  }

  async verifyTransaction(tx_id: string) {
    try {
      const response = await this.flw.Transaction.verify({ id: tx_id });
      return response.data;
    } catch (error) {
      throw new Error('Verification failed');
    }
  }
  async transaction(
    amount: number,
    type: 'deposit',
    ref: string,
    status: 'successful',
    email: string,
    user: User,
  ) {
    try {
      const user = await this.userRepo.findOneBy({ email });
      if (!user) throw new NotFoundException('User not found');

      user.blance += amount;

      await this.userRepo.save(user);
      const newtransaction = this.TxRepo.create({
        amount,
        type,
        ref,
        status,
        email,
        user,
      });

      await this.TxRepo.save(newtransaction);
      return { message: 'Transaction recorded successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Transaction processing failed');
    }
  }
}
