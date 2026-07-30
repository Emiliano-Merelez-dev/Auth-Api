import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({
    example: 'emilianodarte303@gmail.com',
    description: 'Registered user email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'ABc1234@',
    description: 'User account password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
