import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { Group } from 'src/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contribution } from 'src/entities/contribution.entitz';

@Injectable()
export class ContributionService {
  constructor(@InjectRepository(Group) private groupRepo: Repository<Group>,
  @InjectRepository(User) private UserRepo: Repository<User>,
  @InjectRepository(Contribution) private contributionRepo: Repository<Contribution>
){}
    async contribute(groupName: string, amount: number, user: User) {
        try {
          const group = await this.groupRepo.findOne({
            where: { name: groupName },
            relations: ['members'], // make sure to load members
          });
      
          if (!group) throw new BadRequestException('Group not found');
      
          // 🔒 Validation: Group must be active
          if (group.status !== 'active') {
            throw new BadRequestException(`Cannot contribute to a group with status: ${group.status}`);
          }
      
          // 🔒 Validation: Group cycle must be active (based on date)
          const now = new Date();
          if (now < group.startDate || now > group.endDate) {
            throw new BadRequestException('This group is currently not in an active contribution cycle');
          }
      
          // 🔒 Validation: Check if user is a member
          const isMember = group.members.some((member) => member.id === user.id);
          if (!isMember) {
            throw new ForbiddenException('You are not a member of this group');
          }
      
          // 🔒 Validation: Amount must meet group’s required contribution amount
          if (amount < group.contributionAmount) {
            throw new BadRequestException(`Minimum contribution is ₦${group.contributionAmount}`);
          }
      
          // ✅ Save the contribution
          const contribution = this.contributionRepo.create({
            user,
            group,
            amount,
            cycle: group.currentCycle,
            confirmed: true, // or false if you want to wait for payment verification
          });
      
          await this.contributionRepo.save(contribution);
      
          return { message: 'Contribution successful' };
        } catch (error) {
          throw new InternalServerErrorException(error.message || 'An error occurred while contributing');
        }
      }
      
  }

