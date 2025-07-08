import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/entities/group.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { NotificationService } from 'src/administration/notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Group) private groupRepo: Repository<Group>,
    private notificationService: NotificationService,
  ) {}

  async Allgroups(): Promise<Group[]> {
    const groups = await this.groupRepo.find({
      relations: ['members'],
      order: { createdAt: 'DESC' },
    });
    return groups;
  }
  async getUserGroups(userId: number): Promise<Group[]> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['joinedGroups', 'groups'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.joinedGroups;
  }

  async getgroupById(groupId: string): Promise<Group> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });

    if (!group) {
      throw new Error('Group not found');
    }

    return group;
  }

  async joinGroupRequest(name: string, user: User) {
    const group = await this.groupRepo.findOne({
      where: { name },
      relations: ['members'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Check if user is already a member
    const isMember = group.members.some((member) => member.id === user.id);
    if (isMember) {
      throw new Error('You are already a member of this group');
    }

    // Add user to group members
    await this.notificationService.sendJoinRequestNotification(
      user.email,
      name,
    );

    return group.members;
  }
}
