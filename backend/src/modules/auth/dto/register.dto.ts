import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../../common/constants/roles.enum';

export const SELF_REGISTER_ROLES = [Role.STUDENT, Role.INSTRUCTOR] as const;

export class RegisterDto {
  @ApiProperty({
    example: 'student@edupulse.hcmut.edu.vn',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'Student@123456',
    description: 'Strong password (minimum 8 chars, including uppercase, lowercase, and digit)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, and one digit',
  })
  password: string;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Full name' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(120)
  fullName: string;

  @ApiPropertyOptional({
    enum: SELF_REGISTER_ROLES,
    default: Role.STUDENT,
    description: 'Self-registration role (student by default, or instructor)',
  })
  @IsOptional()
  @IsIn(SELF_REGISTER_ROLES, {
    message: 'Public registration only permits student or instructor roles',
  })
  role?: Role = Role.STUDENT;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: 'Profile avatar URL (HTTP/HTTPS only)',
  })
  @IsOptional()
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'Avatar URL must use http:// or https://' },
  )
  @MaxLength(1024)
  avatarUrl?: string;
}
