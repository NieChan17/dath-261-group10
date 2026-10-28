import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/constants/roles.enum';

export class UpdateRoleDto {
  @ApiProperty({ enum: Role, description: 'Vai trò mới của người dùng (student, instructor, admin)' })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
