import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Profile } from 'src/entities/profile.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwt.xonstant';
import { Group } from 'src/entities/group.entity';
import { GroupController } from './group.controller';
import { AdministrationModule } from 'src/administration/administration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Group]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    AdministrationModule
  ],

  providers: [GroupService],

  controllers: [GroupController],
})
export class GroupModule {}
