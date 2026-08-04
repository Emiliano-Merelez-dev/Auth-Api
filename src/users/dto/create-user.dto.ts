import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidRoles } from 'src/roles/interfaces/valid-roles.interface';

export class CreateUserDto {
  @ApiProperty({
    example: 'emilianodarte303@gmail.com',
    description: 'Unique email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string = '';

  @ApiProperty({
    example: 'ABc1234@',
    description:
      'Strong password (must include at least one uppercase letter, one lowercase letter, and one number)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must be stronger: include an uppercase letter, a lowercase letter, and a number',
  })
  password: string = '';

  @ApiPropertyOptional({
    enum: ValidRoles,
    isArray: true,
    example: [ValidRoles.user, ValidRoles.admin],
    description: 'Roles assigned to the user (optional)',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ValidRoles, { each: true })
  roles?: ValidRoles[];

  @ApiPropertyOptional({
    example: false,
    description: 'Email verification status',
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
