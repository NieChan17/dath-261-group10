import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';

@ApiTags('Users Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Danh sách người dùng có phân trang và tìm kiếm (Chỉ Admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng phân trang' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  @ApiOperation({ summary: 'Xem chi tiết thông tin người dùng theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết người dùng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật vai trò người dùng (Chỉ Admin)' })
  @ApiResponse({ status: 200, description: 'Cập nhật vai trò thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(id, dto.role);
  }
}
