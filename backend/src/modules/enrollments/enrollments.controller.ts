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
@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('courses/:courseId/enroll')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Đăng ký khóa học đã xuất bản' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công hoặc trả về đăng ký hiện có' })
  async enroll(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentsService.enroll(courseId, user);
  }

  @Get('enrollments/me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Danh sách khóa học đã đăng ký của học viên' })
  @ApiResponse({ status: 200, description: 'Danh sách khóa học và tiến độ tương ứng' })
  async findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.enrollmentsService.findMine(user);
  }

  @Get('courses/:courseId/enrollment')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Kiểm tra trạng thái đăng ký của học viên cho 1 khóa học' })
  @ApiResponse({ status: 200, description: 'Trạng thái đăng ký khóa học' })
  async getEnrollmentByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentsService.getEnrollmentByCourse(courseId, user);
  }

  @Get('courses/:courseId/progress')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Xem tiến độ học tập trực tiếp theo courseId' })
  @ApiResponse({ status: 200, description: 'Tiến độ học tập chi tiết' })
  @ApiResponse({ status: 404, description: 'Chưa đăng ký khóa học này' })
  async getProgressByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentsService.getProgressByCourse(courseId, user);
  }

  @Get('enrollments/:enrollmentId/progress')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Xem tiến độ học tập của một khóa học đã đăng ký theo enrollmentId' })
  @ApiResponse({ status: 200, description: 'Tiến độ học tập chi tiết' })
  @ApiResponse({ status: 403, description: 'Đăng ký không thuộc học viên hiện tại' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký' })
  async getProgress(
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentsService.getProgress(enrollmentId, user);
  }

  @Patch('enrollments/:enrollmentId/lessons/:lessonId/progress')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Lưu vị trí video hoặc trạng thái hoàn thành của bài học' })
  @ApiResponse({ status: 200, description: 'Cập nhật tiến độ thành công' })
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
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Hủy đăng ký khóa học' })
  @ApiResponse({ status: 200, description: 'Hủy đăng ký thành công' })
  @ApiResponse({ status: 409, description: 'Không thể hủy khóa học đã hoàn thành' })
  async cancel(
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentsService.cancel(enrollmentId, user);
  }

  @Get('courses/:courseId/enrollments')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Danh sách học viên đăng ký khóa học (Dành cho Giảng viên / Quản trị viên)' })
  @ApiResponse({ status: 200, description: 'Danh sách học viên và tỷ lệ hoàn thành' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập khóa học này' })
  async getCourseEnrollments(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.enrollmentsService.getCourseEnrollments(courseId, user);
  }
}
