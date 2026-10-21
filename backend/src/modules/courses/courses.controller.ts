import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CoursesService } from './courses.service';
import { CourseQueryDto } from './dto/course-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/constants/roles.enum';

@ApiTags('Courses Catalog & Syllabus')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Tìm kiếm, lọc và phân trang danh mục khóa học (Catalog API)',
    description: 'Hỗ trợ tìm kiếm từ khóa, lọc theo category, level, instructorId, isPublished và phân trang.',
  })
  @ApiResponse({ status: 200, description: 'Danh sách khóa học phân trang thành công' })
  async findAll(@Query() query: CourseQueryDto, @Req() req: Request) {
    // Current user if authenticated via cookie or bearer
    const user = (req as any).user as CurrentUserPayload | undefined;
    return this.coursesService.findAll(query, user);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết khóa học và toàn bộ cấu trúc bài học/chương mục (Syllabus Tree)',
    description: 'Trả về toàn bộ cây phân cấp Course -> Sections -> Lessons -> Materials/Quiz.',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết khóa học và cây bài học' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khóa học' })
  @ApiResponse({ status: 403, description: 'Khóa học chưa được xuất bản' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = (req as any).user as CurrentUserPayload | undefined;
    return this.coursesService.findById(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Tạo mới khóa học (Chỉ Instructor & Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo khóa học thành công' })
  @ApiResponse({ status: 409, description: 'Mã môn học đã tồn tại' })
  async create(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.create(dto, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin khóa học (Instructor sở hữu hoặc Admin)' })
  @ApiResponse({ status: 200, description: 'Cập nhật khóa học thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền sửa khóa học này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khóa học' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khóa học (Instructor sở hữu hoặc Admin)' })
  @ApiResponse({ status: 200, description: 'Xóa khóa học thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.delete(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @Patch(':id/publish')
  @ApiOperation({ summary: 'Bật/tắt trạng thái xuất bản khóa học (Publish toggle)' })
  @ApiResponse({ status: 200, description: 'Đã thay đổi trạng thái xuất bản' })
  async togglePublish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.togglePublish(id, user);
  }
}
