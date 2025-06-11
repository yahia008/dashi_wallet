import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Profile } from 'src/entities/profile.entity';
import { AuthService } from './auth.service';


@Module({
    imports:[TypeOrmModule.forFeature([User, Profile])],
    providers: [AuthService]
})
export class AuthModule {}
