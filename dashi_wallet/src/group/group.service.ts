import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGroupDto } from 'src/dtos/group.dto';
import { Group } from 'src/entities/group.entity';
import { User } from 'src/entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GroupService {
  constructor(@InjectRepository(Group) private groupRepo: Repository<Group>) {}
  async createGroup(user: User, createGroupDto: CreateGroupDto) {
    try {
      const existGroup = await this.groupRepo.findOneBy({
        name: createGroupDto.name,
      });
      if (existGroup) {
        throw new Error(
          'Group with that name already exists. Choose another name.',
        );
      }

      const newGroup = this.groupRepo.create({
        ...createGroupDto,
        createdBy: user, // Associate the group with the creator (agent)
        currentCycle: 0, // Initialize cycle
        status: 'active', // Set default status
      });

      const savedGroup = await this.groupRepo.save(newGroup);

      return savedGroup;
    } catch (error) {
      throw new Error(error.message || 'Failed to create group');
    }
  }

  async generateInvite(agent: User, groupId: string): Promise<string> {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['createdBy'],
    });

    if (!group) throw new NotFoundException('Group not found');
    if (group.createdBy.id !== agent.id)
      throw new ForbiddenException('Not your group');

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);

    group.inviteToken = hashedToken;
    group.inviteExpiresAt = new Date(Date.now() + 1000 * 60 * 60); // Optional: 1 hr expiry

    await this.groupRepo.save(group);

    return `https://yourapp.com/join-group?token=${token}`;
  }

  async joinGroup(user: User, token: string): Promise<string> {
    // Step 1: Get groups with invite tokens
    const groups = await this.groupRepo.find({
      where: { inviteToken: Not(IsNull()) },
      relations: ['members'],
    });

    // Step 2: Find the group matching the token
    const group = await Promise.all(
      groups.map(async (g) => {
        const match = g.inviteToken
          ? await bcrypt.compare(token, g.inviteToken)
          : false;
        return match ? g : null;
      }),
    ).then((results) => results.find(Boolean));

    // Step 3: Validations
    if (!group) throw new BadRequestException('Invalid invite token');

    // ✅ Check if token is expired
    if (group.inviteExpiresAt && new Date() > group.inviteExpiresAt) {
      throw new BadRequestException('Invite token has expired');
    }

    // ✅ Check if user is already in group
    const isMember = group.members.some((member) => member.id === user.id);
    if (isMember)
      throw new BadRequestException('You are already a member of this group');

    // ✅ Check if group is full
    if (group.members.length >= group.maxMembers) {
      group.inviteToken = null; // optional: revoke token
      await this.groupRepo.save(group);
      throw new BadRequestException('This group is already full');
    }

    // Step 4: Add member
    group.members.push(user);
    await this.groupRepo.save(group);

    return 'You have successfully joined the group';
  }
}
