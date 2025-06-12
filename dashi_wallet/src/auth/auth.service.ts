import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { signUp } from 'src/dtos/sign.dto';
import { Profile } from 'src/entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { sendResetEmail } from 'src/constants/sendmail';

import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from 'src/dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    private jwtService: JwtService,
  ) {}

  async register(dto: signUp): Promise<User> {
    try {
      const user = await this.userRepo.findOneBy({ email: dto.email });
      if (user) throw new BadRequestException('user already exists');

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      const newUser = await this.userRepo.create({
        ...dto,
        password: hashedPassword,
        profile: this.profileRepo.create({}),
      });

      const savedUser = await this.userRepo.save(newUser);
      //const { password, ...safeUser } = savedUser;
      return savedUser;
    } catch (error) {
      // Handle known errors
      if (error instanceof BadRequestException) throw error;

      // Log and throw a generic server error for unknown issues
      console.error('Error during user registration:', error);
      throw new InternalServerErrorException(
        'Something went wrong while registering',
      );
    }
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    try {
      const user = await this.userRepo.findOneBy({ email: dto.email });
      if (!user) throw new BadRequestException('User not found');

      const payload = {
        sub: user.id,
        email: user.email,
        roles: [user.role],
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      // Optional: Log the error or customize it
      console.error('Login error:', error);

      throw new BadRequestException(
        error?.message || 'Login failed due to unexpected error',
      );
    }
  }

  async forgetPassword(email: string): Promise<string> {
    try {
      const user = await this.userRepo.findOneBy({ email });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Generate a secure token and expiration time
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(resetToken, 10);
      const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // expires in 15 mins

      // Save to user record (or PasswordReset table)
      user.resetToken = hashedToken;
      user.tokenExpires = tokenExpires;
      await this.userRepo.save(user);

      // Send the email
      await sendResetEmail(user.email, resetToken);

      return 'Reset link sent to your email';
    } catch (error) {
      console.error('Forget password error:', error);
      throw new BadRequestException(
        error?.message || 'Something went wrong during password reset',
      );
    }
  }
  async resetPassword(token: string, newPassword: string): Promise<string> {
    try {
      if (!token) throw new BadRequestException('Token is required');

      const users = await this.userRepo.find(); // can't query hashed token directly
      const user = await Promise.all(
        users.map(async (u) => {
          const match = u.resetToken
            ? await bcrypt.compare(token, u.resetToken)
            : false;
          return match ? u : null;
        }),
      ).then((results) => results.find(Boolean));

      if (
        !user ||
        !user.tokenExpires ||
        new Date() > new Date(user.tokenExpires)
      ) {
        throw new BadRequestException('Invalid or expired token');
      }

      // Hash new password
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      user.resetToken = null;
      user.tokenExpires = null;
      await this.userRepo.save(user);

      return 'Password reset successful';
    } catch (err) {
      console.error(err);
      throw new BadRequestException(err.message || 'Reset failed');
    }
  }
}
