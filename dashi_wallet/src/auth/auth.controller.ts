import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { forgotDto, signUp } from 'src/dtos/sign.dto';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/dtos/login.dto';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { NotificationService } from 'src/administration/notification/notification.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from 'src/dtos/profile.dto';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authservice:AuthService,
         private readonly notification:NotificationService,
         private readonly profileservice: ProfileService
    ){}

    @Post('signup')
    
    async signUp(@Body() signUp:signUp){

        return await this.authservice.register(signUp)

    }

    @Post('signin')
    
    async signin(@Body() login:LoginDto){

        return await this.authservice.login(login)

    }


    @Post('forgotpassword')
    
      
    async forgotpassword(@Body() body: { email: string }, @Req() req:Request){

       const {email} = body

        const token = crypto.randomBytes(32).toString('hex');
        const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${token}`;

        await this.notification.sendResetEmail(email, resetLink);
        return await this.authservice.forgetPassword(email, token)

    }

    @Patch('reset-password/:token')
    
    async resetpassword(@Param('token') token:string,  @Body() body: { password: string }){

        const {password} = body

             if (!token) {
    throw new BadRequestException('Token is required');
  }


        return await this.authservice.resetPassword(token, password)

    }
     @UseGuards(AuthGuard)
    @Post('create-profile')

    async profile(@Req() req, @Body() dto:CreateProfileDto){
        return await this.profileservice.createProfile(req.user.sub, dto)

            
    }

    //@UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@Req() req){
        //const UserId=req.user.sub
        return 'profile'
    }

     @Get('test')
getTest() {
  return 'Hello from test route!';
}
}


