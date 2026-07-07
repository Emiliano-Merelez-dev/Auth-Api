import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/loginAuthDto';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from 'src/roles/interfaces/valid-roles.interface';
import { RegisterAuthDto } from './dto/registerAuthDto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
// import { RegisterAuthDto } from './dto/registerAuthDto';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Post('resend-verification')
  async resend(@Body() body: { email: string }) {
    return await this.authService.resendVerification(body.email);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return await this.authService.refresh(body.refreshToken);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    // Acá Google nos devuelve el usuario ya validado por nuestra estrategia
    const { user } = req;

    // Acá llamarías a tu servicio para generar tu propio JWT (el que hicimos ayer)
    // const tokens = await this.authService.login(user);

    res.send({ message: 'Login exitoso', user });
  }

  @Get('test-roles')
  @Auth(ValidRoles.admin)
  testAdmin() {
    return { message: 'You are Admin, congratulations' };
  }
}
