import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/loginAuthDto';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from 'src/roles/interfaces/valid-roles.interface';
import { RegisterAuthDto } from './dto/registerAuthDto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { BlacklistService } from './blacklist/blacklist.service';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly blacklistService: BlacklistService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return tokens' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in, returns tokens.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized / Invalid credentials.',
  })
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Validation failed.' })
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request / User already verified or not found.',
  })
  async resend(@Body() body: { email: string }) {
    return await this.authService.resendVerification(body.email);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using a valid refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens successfully refreshed.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized / Invalid or expired refresh token.',
  })
  async refresh(@Body() body: { refreshToken: string }) {
    return await this.authService.refresh(body.refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiOperation({ summary: 'Revoke current access token and log out' })
  @ApiResponse({ status: 200, description: 'Session closed successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized / Missing or invalid token.',
  })
  async logout(@Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return { message: 'No token provided' };
    }

    const token: string = authHeader.split(' ')[1];
    const base64Payload: string = token.split('.')[1];
    const payloadBuffer = Buffer.from(base64Payload, 'base64');
    const payload = JSON.parse(payloadBuffer.toString());

    const expirationTime = payload.exp * 1000;
    const remainingTime = expirationTime - Date.now();

    if (remainingTime > 0) {
      await this.blacklistService.addToBlacklist(token, remainingTime);
    }

    return { message: 'Session closed successfully' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google for OAuth authentication' })
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback handler' })
  @ApiResponse({
    status: 200,
    description: 'Google login successful, returns tokens and user.',
  })
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user as User;

    console.debug(
      `[OAuth] Google profile successfully resolved for email: ${user.email}`,
    );

    const tokens = await this.authService.generateTokens(user);

    res.send({ message: 'Google login successful', user, ...tokens });
  }

  @ApiBearerAuth()
  @Get('test-roles')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Test endpoint reserved for admin role' })
  @ApiResponse({
    status: 200,
    description: 'Access granted, user is an admin.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden / Insufficient permissions.',
  })
  testAdmin() {
    return { message: 'You are Admin, congratulations' };
  }
}
