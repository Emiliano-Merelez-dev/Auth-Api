import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { email, password } = createUserDto;

      // 1. Creamos la instancia (recordá que acá iría el hashing con bcrypt después)
      const newUser = this.userRepository.create({
        email,
        passwordHash: password, // Por ahora guardamos el password directo para probar
      });

      // 2. Guardamos en la base de datos
      return await this.userRepository.save(newUser);
    } catch (error: any) {
      // 3. Manejo de errores (por ejemplo, si el email ya existe)
      if (error.code === '23505') {
        throw new BadRequestException(
          'El email ya está registrado, buscate otro!',
        );
      }
      throw new InternalServerErrorException(
        'Algo explotó en la base de datos',
      );
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
