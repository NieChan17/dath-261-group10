import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles.enum';

@ApiTags('Lessons & Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Post('sections/:sectionId/lessons')
  @ApiOperation({ summary: 'Thêm bài học mới vào một chương (Instructor/Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo bài học thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa' })
  async create(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lessonsService.create(sectionId, dto, user);
  }

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Lấy chi tiết bài học kèm danh sách học liệu và bài quiz' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài học' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lessonsService.findById(id, user);
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Put('lessons/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin bài học' })
  @ApiResponse({ status: 200, description: 'Cập nhật bài học thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lessonsService.update(id, dto, user);
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Delete('lessons/:id')
  @ApiOperation({ summary: 'Xóa bài học' })
  @ApiResponse({ status: 200, description: 'Đã xóa bài học' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lessonsService.delete(id, user);
  }
}
