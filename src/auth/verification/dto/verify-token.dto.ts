import { IsString, IsNotEmpty, IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 👈 No te olvides de importar esto

export class VerifyTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Valid JWT verification token',
  })
  @IsString()
  @IsNotEmpty()
  @IsJWT({ message: 'The provided token does not have a valid JWT format' })
  token!: string;
}
