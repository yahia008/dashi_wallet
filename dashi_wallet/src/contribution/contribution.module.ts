import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { Group } from 'src/entities/group.entity';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments/payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Group])],
  providers: [ContributionService, PaymentsService],
})
export class ContributionModule {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async makePayment() {}
}
