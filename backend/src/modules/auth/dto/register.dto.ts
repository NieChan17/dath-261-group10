import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/constants/roles.enum';

export class RegisterDto {
  @ApiProperty({ example: 'student@edupulse.hcmut.edu.vn', description: 'Địa chỉ email người dùng' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'Password@123', description: 'Mật khẩu tối thiểu 6 ký tự', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên đầy đủ' })
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @ApiPropertyOptional({
    enum: Role,
    default: Role.STUDENT,
    description: 'Vai trò: student (mặc định) hoặc instructor',
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Vai trò không hợp lệ (chỉ chấp nhận student, instructor hoặc admin)' })
  role?: Role = Role.STUDENT;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'Ảnh đại diện' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
