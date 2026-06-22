import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/entities/role.entity';
import { VerificationModule } from './auth/verification/verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        if (!config.JWT_SECRET) throw new Error('JWT_SECRET no configurado');
        return config;
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'auth_user',
      password: 'auth123456',
      database: 'auth_db',
      entities: [User, Role],
      logging: true,
      logger: 'debug',
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    VerificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
