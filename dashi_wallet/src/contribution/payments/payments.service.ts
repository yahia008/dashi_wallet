import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Flutterwave from 'flutterwave-node-v3';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Transaction } from 'src/entities/transaction.entity';
const Flutterwave = require('flutterwave-node-v3');

@Injectable()
export class PaymentsService {
  private flw;

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Transaction) private TxRepo: Repository<Transaction>,
  ) {
    this.flw = new Flutterwave(
      process.env.FLWPUBK,
      process.env.FLWSECK,
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
      email,
      currency: 'NGN',
      redirect_url,
    };

    try {
      const response = await this.flw.Charge.bank_transfer(payload);

      
   return this.transaction(amount, tx_ref=response.transfer_reference, email)
  
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
  private async transaction(
    amount: number,
    ref: string,
    email: string,
  ) {
    try {
       const user = await this.userRepo.findOneBy({ email });
      if (!user) throw new NotFoundException('User not found');

      user.blance += amount;

      await this.userRepo.save(user);

      const newtransaction = this.TxRepo.create({
        amount,
        type: 'deposit',
        ref,
        status: 'successful',
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
