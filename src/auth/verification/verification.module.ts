import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [VerificationController],
  providers: [VerificationService],
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'llave_secretcodifyVerify_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [VerificationService],
})
export class VerificationModule {}
