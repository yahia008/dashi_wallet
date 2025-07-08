import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role/role.guard';
import { Role } from 'src/constants/role.constant';
import { Roles } from 'src/decorators/role.decorator';
import { agent } from 'supertest';



@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin, Role.Agent)
@Controller('agent')
export class AgentController {
    constructor(private readonly AgentService:AgentService){}

    @Get('members')
     async getGroupMembers (@Req() req){
      const user =req.user
      return await this.AgentService.groupMembers(user)
    }

    @Get('agent-groups')
     async getGroupByAgent (@Req() req){
      const user =req.user
      return await this.AgentService.getGroupsByAgent(user)
    }

     @Delete('agent-groups/:groupId')
     async deleteGroup (@Req() req, @Param('groupId') groupId){
      const user =req.user
      return await this.AgentService.deleteGroup(user, groupId)
    }

    @Post('remove-member/:groupId')
        async removeMember(@Req() req, @Body() body:{id:string}, @Param('groupId') groupId){
              const {id} = body
              const user = req.user
              return await this.AgentService.removeMember(user, groupId, Number(id))
        } 
    @Get('agent-group/:groupId')
     async getGroup(@Req() req, @Param('groupId') groupId){
      const user =req.user
      return await this.AgentService.getGroupById(user, groupId)
    }

   @Post('add-member/:groupId')
        async addMember(@Req() req, @Body() body:{email:string}, @Param('groupId') groupId){
              const {email} = body
              const user = req.user
              return await this.AgentService.addMember(groupId, email)
        } 
}
