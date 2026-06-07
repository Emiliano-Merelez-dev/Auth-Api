import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

// En tu RolesService, usa el método onModuleInit para crear los roles automáticamente
@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    const roles = ['admin', 'user'];
    for (const name of roles) {
      const exists = await this.roleRepository.findOneBy({ name });
      if (!exists) {
        await this.roleRepository.save({ name });
        console.log(`Rol ${name} creado.`);
      }
    }
  }
}
