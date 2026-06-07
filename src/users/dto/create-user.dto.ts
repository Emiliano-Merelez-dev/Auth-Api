import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ValidRoles } from 'src/roles/interfaces/valid-roles.interface';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string = '';

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe ser más fuerte: debe incluir una mayúscula, una minúscula y un número',
  })
  password: string = '';

  @IsOptional()
  @IsArray()
  @IsEnum(ValidRoles, { each: true })
  roles?: ValidRoles[];
}
