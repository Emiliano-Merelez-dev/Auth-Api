import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { roles, email, password } = createUserDto;

      const userRoles =
        roles && roles.length > 0
          ? await this.rolesRepository.findBy({ name: In(roles) })
          : [await this.rolesRepository.findOneBy({ name: 'user' })];

      const newUser = this.userRepository.create({
        email,
        passwordHash: password,
        roles: userRoles as Role[],
      });

      return await this.userRepository.save(newUser);
    } catch (error: any) {
      console.log(error);

      if (error.code === '23505') {
        throw new BadRequestException(
          'The email address is already registered',
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
