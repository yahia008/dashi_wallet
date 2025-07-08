import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateGroupDto } from 'src/dtos/group.dto';
import { Role } from 'src/constants/role.constant';
import { Roles } from 'src/decorators/role.decorator';
import { RolesGuard } from 'src/guards/role/role.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin, Role.Agent)
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}
  @Post('create')
  async createGroup(@Body() dto: CreateGroupDto, @Req() req) {
    const user = req.user;
    return await this.groupService.createGroup(user, dto);
  }

  @Get('generate-invite/:id')
  async generateInvite(@Req() req, @Param('id') groupId: string) {
    const agent = req.user;
    return await this.groupService.generateInvite(agent, groupId);
  }
  @Get('join/:token')
  async joinGroup(@Req() req, @Param('token') token: string) {
    const user = req.user;
    return await this.groupService.joinGroup(user, token);
  }

  @Get('my-groups')
  async getMyGroups(@Req() req) {
    const agentId = req.user.id; // Get agent ID from JWT token
    return this.groupService.getGroupsByAgent(agentId);
  }
}
