import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
    constructor(private readonly UserService:UserService){}

    @Get('all-groups')
    async Allgroups() {
        return await this.UserService.Allgroups();
    }
    @Get('user-groups')
    async UserGroups(@Req() req) {
        const user = req.user;
        return await this.UserService.getUserGroups(user.id);
    }

    @Get('group/:id')
    async getGroup(@Req() req, @Param('id') groupId: string) {
        const user = req.user;
        return await this.UserService.getgroupById( groupId);
    }

    @Post('join-request')
    async joinGroup(@Req() req, @Body() body:{groupName:string}){
         const {groupName} = body
        const user = req.user
        return await this.UserService.joinGroupRequest(groupName, user)
    }
}
