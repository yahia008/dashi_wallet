import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGroupDto } from 'src/dtos/group.dto';
import { Group } from 'src/entities/group.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupService {
  constructor(@InjectRepository(Group), private groupRepo:Repository<Group>) {}
  async createGroup(user: User, createGroupDto: CreateGroupDto) {
    try {
      const existGroup = await this.groupRepo.findOneBy({ name: createGroupDto.name });
      if (existGroup) {
        throw new Error('Group with that name already exists. Choose another name.');
      }
  
      const newGroup = this.groupRepo.create({
        ...createGroupDto,
        createdBy: user,           // Associate the group with the creator (agent)
        currentCycle: 0,           // Initialize cycle
        status: 'active',          // Set default status
      });
  
      const savedGroup = await this.groupRepo.save(newGroup);
  
      return savedGroup;
    } catch (error) {
      throw new Error(error.message || 'Failed to create group');
    }
  }
  

} 
