import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { signUp } from 'src/dtos/sign.dto';
import { Profile } from 'src/entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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
        profile:this.profileRepo.create({}),
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

      const payload = { sub: user.id, username: user.email };
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
}
