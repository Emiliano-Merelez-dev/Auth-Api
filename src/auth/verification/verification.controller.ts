import { Controller, Get, Param } from '@nestjs/common';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { VerificationService } from './verification.service';

@Controller('auth/verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('verify/:token')
  verifyAccount(@Param() verifyTokenDto: VerifyTokenDto) {
    return this.verificationService.verifyAccount(verifyTokenDto.token);
  }
}
