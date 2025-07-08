import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Or use SMTP config
    auth: {
      user: 'yahyatijjani99@gmail.com',
      pass: 'eqbjddidjamzstpu', // Gmail app password or SMTP password
    },
  });

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const info = await this.transporter.sendMail({
      from: 'dashi_wallet',
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  }

  async sendResetEmail(email: string, resetLink: string) {
    try {
      await this.transporter.sendMail({
        from: `"dashi_waller"`,
        to: email,
        subject: 'Reset Your Password',
        html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to set a new password. This link will expire in 15 minutes:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <br>
        <p>– YourApp Team</p>
      `,
      });
    } catch (error) {
      throw error;
    }
  }

  async sendInviteEmail(email: string, groupName: string, inviteLink: string) {
    try {
      await this.transporter.sendMail({
        from: '"Dashi Wallet"',
        to: email,
        subject: `You are invited to join the group: ${groupName}`,
        html: `
            <p>Hello,</p>
            <p>You have been invited to join the group <strong>${groupName}</strong>.</p>
            <p>Click the link below to accept the invitation:</p>
            <p><a href="${inviteLink}">Join Group</a></p>
            <p>If you did not expect this invitation, you can ignore this email.</p>
            <br>
            <p>– Dashi Wallet Team</p>
          `,
      });
    } catch (error) {
      throw new Error('Failed to send invite email: ' + error.message);
    }
  }
  async sendTransactionNotification(email: string, amount: number) {
    try {
      await this.transporter.sendMail({
        from: '"Dashi Wallet"',
        to: email,
        subject: 'Transaction Notification',
        html: `
         <p>Hello,</p>

  <p>We’re excited to inform you that a transaction of <strong>₦${amount}</strong> has been successfully made to your account.</p>

  <p>Transaction Details:</p>
  <ul>
    <li><strong>Amount:</strong> ₦${amount}</li>
    <li><strong>Purpose:</strong> Payout from your Dashi Wallet group</li>
    <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
  </ul>

  <p>If you have any questions or concerns, feel free to contact our support.</p>

  <br>

  <p>– Dashi Wallet Team</p>
`,
      });
    } catch (error) {
      throw new Error(
        'Failed to send transaction notification: ' + error.message,
      );
    }
  }

  async sendJoinRequestNotification(userEmail: string, groupName: string) {
    try {
      await this.transporter.sendMail({
        from: '"Dashi Wallet"',
        to: userEmail,
        subject: `Join Request for Group: ${groupName}`,
        html: `
          <p>Hello,</p>
          <p>You have requested to join the group <strong>${groupName}</strong>.</p>
          <p>Your request is being processed. You will receive a notification once your request is approved.</p>
          <br>
          <p>– Dashi Wallet Team</p>
        `,
      });
    } catch (error) {
      throw new Error('Failed to send join request notification: ' + error.message);
    }
  }
}
