import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@ApiTags('Assessment Engine — Quizzes (Trắc nghiệm tính giờ & Chấm tự động)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // ---------------------------------------------------------------------------
  // 1. Quản lý Quiz & Ngân hàng câu hỏi (Instructor, Admin)
  // ---------------------------------------------------------------------------
  @Post('lessons/:lessonId/quizzes')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Tạo bài trắc nghiệm mới cho một bài học kèm câu hỏi ban đầu' })
  @ApiResponse({ status: 201, description: 'Tạo bài trắc nghiệm thành công' })
  async createQuiz(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() dto: CreateQuizDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.createQuiz(lessonId, dto, user);
  }

  @Get('quizzes/:id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết bài trắc nghiệm (ẩn đáp án đối với học viên)',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết bài trắc nghiệm và danh sách câu hỏi' })
  async getQuizDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.getQuizDetail(id, user);
  }

  @Put('quizzes/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin bài trắc nghiệm (thời gian, điểm qua môn...)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateQuiz(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuizDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.updateQuiz(id, dto, user);
  }

  @Delete('quizzes/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Xóa bài trắc nghiệm' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async deleteQuiz(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.deleteQuiz(id, user);
  }

  @Post('quizzes/:id/questions')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Thêm câu hỏi mới vào đề thi trắc nghiệm' })
  @ApiResponse({ status: 201, description: 'Thêm câu hỏi thành công' })
  async addQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateQuestionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.addQuestion(id, dto, user);
  }

  @Put('quizzes/questions/:questionId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật câu hỏi trong đề thi' })
  @ApiResponse({ status: 200, description: 'Cập nhật câu hỏi thành công' })
  async updateQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.updateQuestion(questionId, dto, user);
  }

  @Delete('quizzes/questions/:questionId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Xóa câu hỏi khỏi đề thi' })
  @ApiResponse({ status: 200, description: 'Xóa câu hỏi thành công' })
  async deleteQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.deleteQuestion(questionId, user);
  }

  // ---------------------------------------------------------------------------
  // 2. Học viên: Làm bài trắc nghiệm tính giờ & Chấm tự động
  // ---------------------------------------------------------------------------
  @Post('quizzes/:id/start')
  @Roles(Role.STUDENT, Role.ADMIN)
  @ApiOperation({
    summary: 'Bắt đầu làm bài trắc nghiệm tính giờ (trả về thời gian đếm ngược, câu hỏi ẩn đáp án)',
  })
  @ApiResponse({ status: 200, description: 'Bắt đầu hoặc tiếp tục phiên làm bài' })
  async startQuiz(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.startQuiz(id, user);
  }

  @Post('quizzes/:id/submit')
  @Roles(Role.STUDENT, Role.ADMIN)
  @ApiOperation({
    summary: 'Nộp bài trắc nghiệm & Hệ thống tự động chấm điểm tức thì',
  })
  @ApiResponse({ status: 200, description: 'Kết quả chấm điểm tự động kèm giải thích chi tiết' })
  async submitQuiz(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.submitQuiz(id, dto, user);
  }

  @Get('quizzes/:id/my-submissions')
  @Roles(Role.STUDENT, Role.ADMIN)
  @ApiOperation({ summary: 'Lịch sử các lần làm bài trắc nghiệm của học viên' })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp và điểm số' })
  async getMySubmissions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.getMySubmissions(id, user);
  }

  @Get('quizzes/submissions/:submissionId')
  @ApiOperation({ summary: 'Xem chi tiết một bài nộp trắc nghiệm kèm bảng điểm phân tích' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài nộp đã chấm' })
  async getSubmissionDetail(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.getSubmissionDetail(submissionId, user);
  }

  @Get('quizzes/:id/analytics')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Thống kê kết quả thi trắc nghiệm (tỷ lệ đỗ, điểm TB, phân phối phổ điểm)' })
  @ApiResponse({ status: 200, description: 'Thống kê số liệu bài thi' })
  async getQuizAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizzesService.getQuizAnalytics(id, user);
  }
}
