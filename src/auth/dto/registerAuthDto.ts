import { PartialType } from '@nestjs/mapped-types';
import { LoginAuthDto } from './loginAuthDto';

export class RegisterAuthDto extends PartialType(LoginAuthDto) {}
