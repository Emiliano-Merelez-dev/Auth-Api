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
import { BlacklistService } from './blacklist/blacklist.service';
import { User } from 'src/users/entities/user.entity';
// import { RegisterAuthDto } from './dto/registerAuthDto';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly blacklistService: BlacklistService,
  ) {}

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

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return { message: 'No token provided' };
    }

    const token: string = authHeader.split(' ')[1];
    // Decodificamos el token para extraer su fecha de expiración ("exp") sin verificar firma (ya la verificó el Guard)
    const base64Payload: string = token.split('.')[1];
    const payloadBuffer = Buffer.from(base64Payload, 'base64');
    const payload = JSON.parse(payloadBuffer.toString());

    const expirationTime = payload.exp * 1000; // Pasamos a milisegundos
    const remainingTime = expirationTime - Date.now();

    // Si todavía le queda vida al token, lo mandamos a Redis por el tiempo exacto que le resta
    if (remainingTime > 0) {
      await this.blacklistService.addToBlacklist(token, remainingTime);
    }

    return { message: 'session closed successfully' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // Acá Google nos devuelve el usuario ya validado por nuestra estrategia
    const user = req.user as User;

    console.debug(
      `[OAuth] Google profile successfully resolved for email: ${user.email}`,
    );

    const tokens = await this.authService.generateTokens(user);

    res.send({ message: 'Login con Google exitoso', user, ...tokens });
  }

  @Get('test-roles')
  @Auth(ValidRoles.admin)
  testAdmin() {
    return { message: 'You are Admin, congratulations' };
  }
}
