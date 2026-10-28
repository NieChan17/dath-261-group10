import {
  Controller,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles.enum';

@ApiTags('Sections & Chapters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Post('courses/:courseId/sections')
  @ApiOperation({ summary: 'Thêm chương mục mới vào khóa học (Instructor/Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo chương mục thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa khóa học' })
  async create(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: CreateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sectionsService.create(courseId, dto, user);
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Put('sections/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin chương mục' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chương mục' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sectionsService.update(id, dto, user);
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Delete('sections/:id')
  @ApiOperation({ summary: 'Xóa chương mục (kèm xóa tất cả bài học con)' })
  @ApiResponse({ status: 200, description: 'Đã xóa chương mục' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chương mục' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sectionsService.delete(id, user);
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Patch('courses/:courseId/sections/reorder')
  @ApiOperation({ summary: 'Sắp xếp lại thứ tự các chương mục trong khóa học' })
  @ApiResponse({ status: 200, description: 'Sắp xếp thứ tự thành công' })
  async reorder(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: ReorderSectionsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sectionsService.reorder(courseId, dto, user);
  }
}
