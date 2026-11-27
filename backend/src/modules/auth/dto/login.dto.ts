import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'student@edupulse.hcmut.edu.vn',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Student@123456', description: 'Account password' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(128)
  password: string;
}
