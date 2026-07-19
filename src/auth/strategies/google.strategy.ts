import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  VerifyCallback,
  StrategyOptions,
} from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { ValidRoles } from 'src/roles/interfaces/valid-roles.interface';

interface GoogleProfile {
  emails: { value: string }[];
  name: { givenName: string; familyName: string };
  photos: { value: string }[];
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const profileData = profile as GoogleProfile;
    const email = profileData.emails?.[0]?.value;

    if (!email) {
      return done(
        new UnauthorizedException('email not found in google profile'),
        false,
      );
    }

    let user = await this.userService.findOneByEmail(email);

    // Si el usuario no existe en la base de datos, lo creamos automáticamente (Opción A)
    if (!user) {
      console.log(
        `[GoogleStrategy] User with email ${email} not found. Creating new user...`,
      );

      user = await this.userService.create({
        email,
        // Como viene de Google, le metemos una contraseña aleatoria robusta porque nunca la va a usar para loguearse por form
        password: Math.random().toString(36).slice(-8) + 'Ab1!',
        roles: [ValidRoles.user], // O el rol por defecto que uses
        isVerified: true,
      });
    }

    // Devolvemos el usuario para que Passport lo inyecte en req.user
    done(null, user);
  }
}
