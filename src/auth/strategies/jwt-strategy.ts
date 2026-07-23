import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { BlacklistService } from '../blacklist/blacklist.service'; // <--- 1. Importamos el servicio
import { Request } from 'express'; // <--- 2. Importamos Request para extraer el token crudo

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
    private readonly blacklistService: BlacklistService, // <--- 3. Lo inyectamos
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET')!,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true, // <--- 4. CLAVE: Le decimos que nos pase el objeto "req" completo a validate()
    });
  }

  // Modificamos la firma para recibir "req" como primer parámetro
  async validate(req: Request, payload: JwtPayload): Promise<User> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    // 5. Verificamos si el token está en la lista negra
    if (token) {
      const isBlacklisted = await this.blacklistService.isBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked (logged out)');
      }
    }

    const { id } = payload;

    const user = await this.userRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('Token not valid');
    }

    if (!user.isVerified)
      throw new UnauthorizedException('User not verified your account');

    return user;
  }
}
