import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';

@Module({
  providers: [ContributionService]
})
export class ContributionModule {}
