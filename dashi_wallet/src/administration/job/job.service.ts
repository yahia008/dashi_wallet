import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from 'src/entities/group.entity';
import { Contribution } from 'src/entities/contribution.entitz';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class GroupSchedulerService {
  private readonly logger = new Logger(GroupSchedulerService.name);

  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(Transaction)
    private readonly TransactionRepo: Repository<Transaction>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Contribution)
    private readonly contributionRepo: Repository<Contribution>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async handleCycleManagement() {
    const groups = await this.groupRepo.find({
      relations: ['members'],
    });

    for (const group of groups) {
      // Skip if group is not active
      if (group.status !== 'active') continue;

      // Get all contributions for current cycle
      const contributions = await this.contributionRepo.find({
        where: {
          group: { id: group.id },
          cycle: group.currentCycle,
          confirmed: true,
        },
      });

      // Check if all members contributed
      if (contributions.length === group.members.length) {
        group.currentCycle += 1;

        // Optional: end group if max cycle reached (e.g., members.length)
        if (group.currentCycle > group.members.length) {
          group.status = 'completed';
        }

        await this.groupRepo.save(group);
        this.logger.log(
          `Group "${group.name}" moved to cycle ${group.currentCycle}`,
        );
      }
    }

    this.logger.log('✅ Group cycle check complete at 11 PM');
  }

  async payoutJob() {
    const groups = await this.groupRepo.find({
      relations: ['members'],
    });

    for (const group of groups) {
      if (group.status !== 'active') continue;

      const contributions = await this.contributionRepo.find({
        where: {
          group: { id: group.id },
          cycle: group.currentCycle,
          confirmed: true,
        },
        relations: ['user'],
      });

      // Skip if not all members contributed
      if (contributions.length !== group.members.length) continue;

      // Check if payout already done for this cycle
      const alreadyPaid = await this.TransactionRepo.findOne({
        where: {
          group: { id: group.id },
          cycle: group.currentCycle,
          type: 'payout',
          status: 'successful',
        },
      });

      if (alreadyPaid) continue; // avoid double payout

      // Determine recipient (rotate by member order and cycle number)
      const payoutIndex = group.currentCycle % group.members.length;
      const recipient = group.members[payoutIndex];

      // Total contribution amount for the cycle
      const totalAmount = group.contributionAmount * group.members.length;

      recipient.blance += totalAmount;
      await this.userRepo.save(recipient);

      // 💾 Save payout transaction
      await this.TransactionRepo.save({
        user: recipient,
        group,
        amount: totalAmount,
        cycle: group.currentCycle,
        type: 'payout',
        status: 'successful',
        email: recipient.email,
        description: `Payout for cycle ${group.currentCycle}`,
      });

      this.logger.log(
        `✅ Payout of ₦${totalAmount} sent to ${recipient.firstName} for group "${group.name}" in cycle ${group.currentCycle}`,
      );
    }
  }
}
