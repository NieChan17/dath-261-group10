import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';
import { EnrollmentsService } from './enrollments.service';

@ApiTags('Enrollments & Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('courses/:courseId/enroll')
  @ApiOperation({ summary: 'Đăng ký khóa học đã xuất bản' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công hoặc trả về đăng ký hiện có' })
  async enroll(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentsService.enroll(courseId, user);
  }

  @Get('enrollments/me')
  @ApiOperation({ summary: 'Danh sách khóa học đã đăng ký của học viên' })
  async findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.enrollmentsService.findMine(user);
  }

  @Get('enrollments/:enrollmentId/progress')
  @ApiOperation({ summary: 'Xem tiến độ học tập của một khóa học đã đăng ký' })
  @ApiResponse({ status: 403, description: 'Đăng ký không thuộc học viên hiện tại' })
  async getProgress(
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentsService.getProgress(enrollmentId, user);
  }

  @Patch('enrollments/:enrollmentId/lessons/:lessonId/progress')
  @ApiOperation({ summary: 'Lưu vị trí hoặc trạng thái hoàn thành của bài học' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật tiến độ này' })
  async updateProgress(
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() dto: UpdateLessonProgressDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentsService.updateProgress(enrollmentId, lessonId, dto, user);
  }

  @Delete('enrollments/:enrollmentId')
  @ApiOperation({ summary: 'Hủy đăng ký khóa học' })
  async cancel(
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentsService.cancel(enrollmentId, user);
  }
}
