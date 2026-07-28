import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt-strategy';
import { RolesModule } from 'src/roles/roles.module';
import { VerificationModule } from './verification/verification.module';
import { UsersService } from 'src/users/users.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { BlacklistService } from './blacklist/blacklist.service';

@Module({
  imports: [
    ConfigModule,
    RolesModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '2h' },
      }),
    }),
    VerificationModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ConfigService,
    UsersService,
    GoogleStrategy,
    BlacklistService,
  ],
})
export class AuthModule {}
