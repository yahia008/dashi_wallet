import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/entities/group.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Group) private groupRepo: Repository<Group>,
  ) {}

  async groupMembers(user: User): Promise<Group[]> {
    return await this.groupRepo.find({
      where: { createdBy: { id: user.id } },
      relations: ['members'],
      order: { createdAt: 'DESC' },
    });
  }

  async getGroupsByAgent(agentId: number) {
    try {
      return await this.groupRepo.find({
        where: {
          createdBy: { id: agentId },
        },
        relations: ['createdBy'],
        select: {
          createdBy: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
          },
        },
        order: { createdAt: 'DESC' }, // Most recent first
      });
    } catch (error) {
      throw new Error('Failed to fetch agent groups');
    }
  }

  async deleteGroup(agent: User, groupId: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['createdBy'],
    });

    if (!group) throw new NotFoundException('Group not found');
    if (group.createdBy.id !== agent.id)
      throw new ForbiddenException('Not your group');

    // Remove the group
    await this.groupRepo.remove(group);

    return { message: 'Group deleted successfully' };
  }

  async removeMember(agent: User, groupId: string, memberId: number) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['createdBy', 'members'],
    });

    if (!group) throw new NotFoundException('Group not found');
    if (group.createdBy.id !== agent.id)
      throw new ForbiddenException('Not your group');

    const member = group.members.find((m) => m.id === memberId);
    if (!member) throw new NotFoundException('Member not found in this group');

    // Remove the member
    group.members = group.members.filter((m) => m.id !== memberId);
    await this.groupRepo.save(group);

    return { message: 'Member removed successfully' };
  }

  async getGroupById(agent: User, groupId: string) {
    const group = await this.groupRepo.findOneBy({ id: groupId });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.createdBy.id !== agent.id)
      throw new ForbiddenException('Not your group');

    return group;
  }

  async getGroupMembers(agent: User, groupId: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members', 'createdBy'],
    });

    if (!group) throw new NotFoundException('Group not found');
    if (group.createdBy.id !== agent.id)
      throw new ForbiddenException('Not your group');

    return group.members;
  }
  m;
  // You need to know which group to add the member to, so add a groupId parameter
  async addMember(groupId: string, email: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find the group and include members relation
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if user is already a member
    if (group.members.some((member) => member.id === user.id)) {
      throw new ForbiddenException('User is already a member of this group');
    }

    // Add user to group members
    group.members.push(user);
    await this.groupRepo.save(group);

    return { message: 'Member added successfully' };
  }
}
