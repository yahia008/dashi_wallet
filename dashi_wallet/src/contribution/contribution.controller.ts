import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments/payments.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { v4 as uuidv4 } from 'uuid';

@UseGuards(AuthGuard)
@Controller('contribution')
export class ContributionController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('deposit')
  async deposit(@Body() body: { amount: number }, @Req() req) {
    const user = req.user; // assuming AuthGuard attaches user to req
    if (!user || !user.email) {
      throw new BadRequestException('User email is required');
    }
    const email = user.email;
    const amount = body.amount;
    if (!amount) throw new BadRequestException('Amount is required');
    const tx_ref = `dashi-${uuidv4()}`; // generate unique tx_ref
    const redirect_url = `http://localhost:3000/payment/verify/${tx_ref}`; // your frontend redirect handler

    const paymentLink = await this.paymentService.initiatePayment(
      email,
      amount,
      tx_ref,
      redirect_url,
    );

    return { link: paymentLink };
  }

  @Post('update')
  async balanceUpdate(@Body() body: { amount: number }, @Req() req) {
    const user = req.user;
    const { amount } = body; // assuming AuthGuard attaches user to req
    if (!user || !user.email) {
      throw new BadRequestException('User email is required');
    }
    const email = user.email;
    const tx_ref = `dashi-${uuidv4()}`; // generate unique tx_ref

    return await this.paymentService.transaction(amount, tx_ref, email);
  }
}
