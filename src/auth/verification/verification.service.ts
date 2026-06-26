import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  createVerificationToken(email: string) {
    return this.jwtService.sign({ email }, { expiresIn: '15m' });
  }

  async verifyAccount(token: string) {
    let payload: { email: string };

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Token inválido o expirado');
    }

    const user = await this.userRepository.findOne({
      where: { email: payload.email },
      select: {
        id: true,
        isVerified: true,
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.isVerified)
      throw new BadRequestException('La cuenta ya está verificada');

    await this.userRepository.update(user.id, { isVerified: true });

    return { message: 'Cuenta verificada con éxito' };
  }
}
