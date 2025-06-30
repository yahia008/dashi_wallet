import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/entities/group.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AgentService {
    constructor(@InjectRepository(User) private userRepo:Repository<User>,
        @InjectRepository(Group) private groupRepo:Repository<Group> ){

    }

    async groupMembers(user: User): Promise<Group[]> {
  return await this.groupRepo.find({
    where: { createdBy: { id: user.id } },
    relations: ['members'],
    order: { createdAt: 'DESC' },
  });
}

async removeMember(agent: User, groupId: string, memberId: number) {
  const group = await this.groupRepo.findOne({
    where: { id: groupId },
    relations: ['createdBy', 'members'],
  });

  if (!group) throw new NotFoundException('Group not found');

  // 🔒 Check if agent is the creator
  if (group.createdBy.id !== agent.id) {
    throw new ForbiddenException('You are not allowed to modify this group');
  }

  // ✅ Remove member from members array
  group.members = group.members.filter((m) => m.id !== memberId);

  await this.groupRepo.save(group);

  return { message: 'Member removed successfully' };
}





}
