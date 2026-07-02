import {
  Injectable,
  UnauthorizedException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { LoginAuthDto } from './dto/loginAuthDto';
import { RegisterAuthDto } from './dto/registerAuthDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { VerificationService } from './verification/verification.service';
import { UsersService } from 'src/users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from 'src/roles/interfaces/valid-roles.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly verificationService: VerificationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    const { email, password } = registerDto;

    if (!email || !password) {
      throw new BadRequestException('Email y contraseña son obligatorios');
    }

    const user = await this.usersService.create({
      email,
      password,
      roles: [ValidRoles.user],
    });
    const vToken = this.verificationService.createVerificationToken(user.email);
    return { user, verificationToken: vToken };
  }

  async login(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findOneByEmail(email);

    if (!user) throw new UnauthorizedException('Credenciales no válidas');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid)
      throw new UnauthorizedException('Credenciales no válidas');

    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (user.isVerified)
      throw new BadRequestException('El usuario ya está verificado');

    const vToken = this.verificationService.createVerificationToken(user.email);
    return { verificationToken: vToken };
  }

  async generateTokens(user: User) {
    const payload = { id: user.id };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.cacheManager.set(
      `refresh_token:${user.id}`,
      refreshToken,
      7 * 24 * 60 * 60 * 1000,
    );

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.id as string;

      const storedToken = await this.cacheManager.get(
        `refresh_token:${userId}`,
      );

      if (!storedToken || storedToken !== refreshToken) {
        await this.cacheManager.del(`refresh_token:${userId}`);
        throw new UnauthorizedException(
          'Intento de uso de token duplicado/inválido',
        );
      }

      const user = await this.usersService.findOneById(userId);

      // Si el usuario no existe, lanzamos excepción antes de intentar generar tokens
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return await this.generateTokens(user);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        'Sesión expirada, por favor logueate de nuevo',
      );
    }
  }
}
