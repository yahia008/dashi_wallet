import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProfileDto } from 'src/dtos/profile.dto';
import { Profile } from 'src/entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  async createProfile(userId: number, dto: CreateProfileDto): Promise<Profile> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['profile'],
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.profile) {
        throw new BadRequestException('Profile already exists for this user');
      }

      const profile = this.profileRepo.create(dto);
      const savedProfile = await this.profileRepo.save(profile);

      user.profile = savedProfile;
      await this.userRepo.save(user);

      return savedProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new InternalServerErrorException(
        error?.message || 'Something went wrong while creating profile',
      );
    }
  }

  async getPro(userId: number): Promise<{ profile: Profile; balance: number }> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['profile'],
      });

      if (!user || !user.profile) {
        throw new BadRequestException('Profile not found for this user');
      }

      return {
      profile: user.profile,
      balance: user.blance, // ← make sure your property is spelled correctly
    };;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new InternalServerErrorException(
        error?.message || 'Something went wrong while fetching profile',
      );
    }
  }
}
