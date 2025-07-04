import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { Group } from 'src/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contribution } from 'src/entities/contribution.entitz';
import { Transaction } from 'src/entities/transaction.entity';

@Injectable()
export class ContributionService {
  constructor(@InjectRepository(Group) private groupRepo: Repository<Group>,
  @InjectRepository(User) private UserRepo: Repository<User>,
   @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
  @InjectRepository(Contribution) private contributionRepo: Repository<Contribution>
){}
    async contribute(groupName: string, amount: number, user: User) {
        try {
          const group = await this.groupRepo.findOne({
            where: { name: groupName },
            relations: ['members'], 
          });
      
          if (!group) throw new BadRequestException('Group not found');
      
         
          if (group.status !== 'active') {
            throw new BadRequestException(`Cannot contribute to a group with status: ${group.status}`);
          }
      
          
          const now = new Date();
          if (now < group.startDate || now > group.endDate) {
            throw new BadRequestException('This group is currently not in an active contribution cycle');
          }
      
         
          const isMember = group.members.some((member) => member.id === user.id);
          if (!isMember) {
            throw new ForbiddenException('You are not a member of this group');
          }
      
         
          if (amount < group.contributionAmount) {
            throw new BadRequestException(`Minimum contribution is ₦${group.contributionAmount}`);
          }
      
          
          const contribution = this.contributionRepo.create({
            user,
            group,
            amount,
            cycle: group.currentCycle,
            confirmed: true, 
          });
      
          await this.contributionRepo.save(contribution);

          group.blance = group.blance + amount;
          await this.groupRepo.save(group);

          user.blance = user.blance - amount;
          await this.UserRepo.save(user);
      
          return { message: 'Contribution successful' };
        } catch (error) {
          throw new InternalServerErrorException(error.message || 'An error occurred while contributing');
        }
      }

      async contributionHistory(user: User) {
  return await this.contributionRepo.find({
    where: { user: { id: user.id } },
    relations: ['group'], 
    order: { createdAt: 'DESC' }, 
  });
}


async transactionHistory(user:User){
  return await this.transactionRepo.find({
    where: { user: { id: user.id } },
    relations: ['group'], 
    order: { createdAt: 'DESC' }, 
  })
}
      

  }
 
