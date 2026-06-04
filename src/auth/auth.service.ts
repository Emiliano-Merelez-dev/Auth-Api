import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginAuthDto } from './dto/loginAuthDto';
// import { RegisterAuthDto } from './dto/registerAuthDto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales no válidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials not válida');
    }

    const token = this.jwtService.sign({ id: user.id });

    return {
      email: user.email,
      token: token,
    };
  }
}
