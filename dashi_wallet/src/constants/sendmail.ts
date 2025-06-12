import * as nodemailer from 'nodemailer';

export async function sendResetEmail(
  email: string,
  token: string,
): Promise<void> {
  try {
    const resetLink = `https://yourapp.com/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"YourApp Support" <${process.env.EMAIL_FROM}>`,
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

    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send reset email:', error);
    throw new Error('Could not send password reset email.');
  }
}
