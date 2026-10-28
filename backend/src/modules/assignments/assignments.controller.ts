import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { diskStorage } from 'multer';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { CreateRubricDto } from './dto/create-rubric.dto';
import { UpdateRubricDto } from './dto/update-rubric.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

const uploadDir = path.resolve(process.cwd(), 'uploads/assignments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Assessment Engine — Assignments & Rubrics (Bài tập nộp file & Chấm Rubric)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  // ---------------------------------------------------------------------------
  // 1. Quản lý Bài tập Nộp file (Instructor, Admin)
  // ---------------------------------------------------------------------------
  @Post('lessons/:lessonId/assignments')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Tạo bài tập nộp file mới kèm bộ tiêu chí rubric chấm điểm' })
  @ApiResponse({ status: 201, description: 'Tạo bài tập kèm rubric thành công' })
  async createAssignment(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.createAssignment(lessonId, dto, user);
  }

  @Get('assignments/:id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết bài tập kèm bảng tiêu chí rubric' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài tập và tiêu chí rubric' })
  async getAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.getAssignment(id, user);
  }

  @Put('assignments/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin bài tập (hạn nộp, điểm tối đa, định dạng file...)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssignmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.updateAssignment(id, dto, user);
  }

  @Delete('assignments/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Xóa bài tập' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async deleteAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.deleteAssignment(id, user);
  }

  // ---------------------------------------------------------------------------
  // 2. Quản lý Tiêu chí Rubric (Rubric Criteria)
  // ---------------------------------------------------------------------------
  @Post('assignments/:id/rubrics')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Thêm tiêu chí rubric mới vào bài tập' })
  @ApiResponse({ status: 201, description: 'Thêm tiêu chí rubric thành công' })
  async addRubric(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRubricDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.addRubric(id, dto, user);
  }

  @Put('assignments/rubrics/:rubricId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật tiêu chí rubric' })
  @ApiResponse({ status: 200, description: 'Cập nhật tiêu chí thành công' })
  async updateRubric(
    @Param('rubricId', ParseUUIDPipe) rubricId: string,
    @Body() dto: UpdateRubricDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.updateRubric(rubricId, dto, user);
  }

  @Delete('assignments/rubrics/:rubricId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Xóa tiêu chí rubric' })
  @ApiResponse({ status: 200, description: 'Xóa tiêu chí thành công' })
  async deleteRubric(
    @Param('rubricId', ParseUUIDPipe) rubricId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.deleteRubric(rubricId, user);
  }

  // ---------------------------------------------------------------------------
  // 3. Học viên: Nộp file bài tập & Xem kết quả nộp bài
  // ---------------------------------------------------------------------------
  @Post('assignments/:id/submit')
  @Roles(Role.STUDENT, Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          const base = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_');
          cb(null, `${base}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // Giới hạn multer tối đa 50MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Nộp file bài tập (Hỗ trợ upload file trực tiếp hoặc truyền fileUrl, kiểm tra hạn nộp)',
  })
  @ApiResponse({ status: 201, description: 'Nộp bài tập thành công' })
  async submitAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: SubmitAssignmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.submitAssignment(id, file, dto, user);
  }

  @Get('assignments/:id/my-submission')
  @Roles(Role.STUDENT, Role.ADMIN)
  @ApiOperation({
    summary: 'Xem bài nộp của học viên cho bài tập này (kèm điểm số và nhận xét theo từng rubric nếu đã chấm)',
  })
  @ApiResponse({ status: 200, description: 'Thông tin bài nộp' })
  async getMySubmission(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.getMySubmission(id, user);
  }

  // ---------------------------------------------------------------------------
  // 4. Giảng viên: Chấm điểm bài nộp theo bảng Rubric
  // ---------------------------------------------------------------------------
  @Get('assignments/:id/submissions')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({
    summary: 'Lấy toàn bộ danh sách bài nộp của học viên trong bài tập (thống kê nộp bài, trễ hạn, điểm số)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp' })
  async getAssignmentSubmissions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.getAssignmentSubmissions(id, user);
  }

  @Post('assignments/submissions/:submissionId/grade')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({
    summary: 'Chấm điểm bài nộp theo từng tiêu chí trong bảng Rubric',
  })
  @ApiResponse({ status: 200, description: 'Chấm điểm và cập nhật điểm thành công' })
  async gradeSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: GradeSubmissionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.assignmentsService.gradeSubmission(submissionId, dto, user);
  }

  // ---------------------------------------------------------------------------
  // 5. Tải file bài nộp an toàn
  // ---------------------------------------------------------------------------
  @Get('assignments/files/:filename')
  @ApiOperation({ summary: 'Tải file bài nộp đã upload' })
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(uploadDir, sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Không tìm thấy file bài nộp trên hệ thống',
      });
    }

    return res.sendFile(filePath);
  }
}
