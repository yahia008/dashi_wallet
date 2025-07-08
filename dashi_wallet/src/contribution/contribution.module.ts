import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { Group } from 'src/entities/group.entity';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments/payments.service';
import { Transaction } from 'src/entities/transaction.entity';
import { Contribution } from 'src/entities/contribution.entitz';
import { ContributionController } from './contribution.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Group, Transaction, Contribution]),
  ],
  providers: [ContributionService, PaymentsService],
  controllers: [ContributionController],
})
export class ContributionModule {}
