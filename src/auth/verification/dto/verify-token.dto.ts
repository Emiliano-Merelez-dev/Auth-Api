import { IsString, IsNotEmpty, IsJWT } from 'class-validator';

export class VerifyTokenDto {
  @IsString()
  @IsNotEmpty()
  @IsJWT({ message: 'El token proporcionado no tiene formato JWT válido' })
  token!: string;
}
