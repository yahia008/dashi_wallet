import { Module } from '@nestjs/common';

import { AgentService } from './agent/agent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { Group } from 'src/entities/group.entity';
import { Contribution } from 'src/entities/contribution.entitz';
import { Transaction } from 'src/entities/transaction.entity';
import { NotificationService } from './notification/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Group, Contribution, Transaction]),],
  providers: [AgentService, NotificationService],
  exports:[NotificationService]

})
export class AdministrationModule {}
