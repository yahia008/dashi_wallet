import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { ContributionModule } from './contribution/contribution.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    url: 'postgresql://authentication_cv8m_user:nB61GVdLEPKZ8QuSGyAuWB20jVSY9ymY@dpg-d0uohqk9c44c73bj636g-a.oregon-postgres.render.com/authentication_cv8m',
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false, // Accept Render's self-signed cert
      },
    },
    autoLoadEntities: true,
    synchronize: true,
  }), AuthModule, GroupModule, ContributionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
