import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { signUp } from 'src/dtos/sign.dto';
import { Profile } from 'src/entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
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
}
