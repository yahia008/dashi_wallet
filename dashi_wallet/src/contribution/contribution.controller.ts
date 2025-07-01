import { BadRequestException, Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments/payments.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { v4 as uuidv4 } from 'uuid';

@UseGuards(AuthGuard)
@Controller('contribution')
export class ContributionController {
    constructor(
        private readonly paymentService:PaymentsService
    ){

    }

   
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
    const redirect_url = `http://localhost:3000/payment/verify`; // your frontend redirect handler
    
    const paymentLink = await this.paymentService.initiatePayment(
      email,
      amount,
      tx_ref,
      redirect_url,
    );

    return { link: paymentLink }
  }

    @Post('payment/webhook')
  async handleWebhook(@Req() req) {
    const payload = req.body;

    if (
      payload.event === 'charge.completed' &&
      payload.data.status === 'successful'
    ) {
      const { id: transactionId, tx_ref, amount, customer } = payload.data;
      const email = customer.email;
      console.log('🔥 Received webhook from Flutterwave:');
      console.log(JSON.stringify(req.body, null, 2))

      return await this.paymentService.transaction(amount, tx_ref, email, transactionId)

      
    }

    return { message: 'Webhook received but ignored' };
  }

   @Get('verify')
  async verifyPayment(
    @Query('transaction_id') transaction_id: string,
    @Query('status') status: string,
    @Query('tx_ref') tx_ref: string,
    @Res() res,
    @Req() req
  ) {
    const email = req.user.email
    
      if (!transaction_id || status !== 'successful') {
        return res.status(400).send('Invalid or failed transaction.');
      }

      // 1. Verify with Flutterwave
      const transaction = await this.paymentService.verifyTransaction(transaction_id);
      
    return  await this.paymentService.transaction(transaction.amount, tx_ref, email, transaction_id)  

  }

}