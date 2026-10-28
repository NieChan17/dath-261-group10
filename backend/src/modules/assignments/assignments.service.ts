import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseService } from '../../database/database.service';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles.enum';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { CreateRubricDto } from './dto/create-rubric.dto';
import { UpdateRubricDto } from './dto/update-rubric.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly db: DatabaseService) {}

  // ---------------------------------------------------------------------------
  // Helper Checks
  // ---------------------------------------------------------------------------
  private async getAssignmentContext(assignmentId: string) {
    const context = await this.db.queryOne<{
      assignment_id: string;
      title: string;
      description: string;
      allowed_file_types: any;
      max_file_size_mb: number;
      due_date: Date | null;
      total_points: number;
      pass_score: number;
      lesson_id: string;
      lesson_title: string;
      section_id: string;
      course_id: string;
      course_title: string;
      instructor_id: string;
    }>(
      `SELECT a.id AS assignment_id, a.title, a.description, a.allowed_file_types,
              a.max_file_size_mb, a.due_date, a.total_points, a.pass_score,
              l.id AS lesson_id, l.title AS lesson_title,
              s.id AS section_id,
              c.id AS course_id, c.title AS course_title, c.instructor_id
       FROM assignments a
       JOIN lessons l ON a.lesson_id = l.id
       JOIN sections s ON l.section_id = s.id
       JOIN courses c ON s.course_id = c.id
       WHERE a.id = $1`,
      [assignmentId],
    );

    if (!context) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID: ${assignmentId}`);
    }
    return context;
  }

  private async verifyLessonOwnership(lessonId: string, user: CurrentUserPayload) {
    const res = await this.db.queryOne<{
      lesson_id: string;
      course_id: string;
      instructor_id: string;
    }>(
      `SELECT l.id AS lesson_id, c.id AS course_id, c.instructor_id
       FROM lessons l
       JOIN sections s ON l.section_id = s.id
       JOIN courses c ON s.course_id = c.id
       WHERE l.id = $1`,
      [lessonId],
    );

    if (!res) {
      throw new NotFoundException(`Không tìm thấy bài học với ID: ${lessonId}`);
    }

    const isAdmin = user.role === Role.ADMIN;
    const isOwner = user.userId === res.instructor_id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền quản lý nội dung của khóa học này');
    }
    return res;
  }

  // ---------------------------------------------------------------------------
  // 1. Quản lý Bài tập Nộp file (Giảng viên / Admin)
  // ---------------------------------------------------------------------------
  async createAssignment(
    lessonId: string,
    dto: CreateAssignmentDto,
    user: CurrentUserPayload,
  ) {
    await this.verifyLessonOwnership(lessonId, user);

    const existing = await this.db.queryOne(
      'SELECT id FROM assignments WHERE lesson_id = $1',
      [lessonId],
    );
    if (existing) {
      throw new BadRequestException('Bài học này đã có một bài tập nộp file');
    }

    return this.db.transaction(async (client) => {
      const allowedTypes = dto.allowedFileTypes || ['zip', 'pdf', 'tar.gz'];

      const asgRes = await client.query(
        `INSERT INTO assignments (lesson_id, title, description, allowed_file_types, max_file_size_mb, due_date, total_points, pass_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          lessonId,
          dto.title.trim(),
          dto.description.trim(),
          JSON.stringify(allowedTypes),
          dto.maxFileSizeMb ?? 25,
          dto.dueDate ? new Date(dto.dueDate) : null,
          dto.totalPoints ?? 100,
          dto.passScore ?? 50,
        ],
      );
      const newAssignment = asgRes.rows[0];

      // Đổi content_type của bài học sang 'assignment'
      await client.query(
        "UPDATE lessons SET content_type = 'assignment' WHERE id = $1",
        [lessonId],
      );

      // Tạo các tiêu chí rubric ban đầu nếu có
      const createdRubrics: any[] = [];
      if (dto.rubrics && dto.rubrics.length > 0) {
        let order = 1;
        for (const rub of dto.rubrics) {
          const rubRes = await client.query(
            `INSERT INTO assignment_rubrics (assignment_id, criterion_name, description, max_points, order_index, levels)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
              newAssignment.id,
              rub.criterionName.trim(),
              rub.description || null,
              rub.maxPoints,
              rub.orderIndex ?? order++,
              JSON.stringify(rub.levels || []),
            ],
          );
          createdRubrics.push(rubRes.rows[0]);
        }
      }

      return {
        success: true,
        message: 'Tạo bài tập kèm rubric chấm điểm thành công',
        data: {
          ...newAssignment,
          totalPoints: Number(newAssignment.total_points),
          passScore: Number(newAssignment.pass_score),
          allowedFileTypes: allowedTypes,
          rubrics: createdRubrics,
        },
      };
    });
  }

  async getAssignment(assignmentId: string, user: CurrentUserPayload) {
    const ctx = await this.getAssignmentContext(assignmentId);

    const rubrics = await this.db.query(
      `SELECT id, criterion_name, description, max_points, order_index, levels
       FROM assignment_rubrics
       WHERE assignment_id = $1
       ORDER BY order_index ASC`,
      [assignmentId],
    );

    let mySubmission: any = null;
    if (user.role === Role.STUDENT) {
      const sub = await this.db.queryOne(
        `SELECT id, file_url, original_filename, file_size_bytes, mime_type, notes,
                status, total_score, is_late, feedback, submitted_at, graded_at
         FROM assignment_submissions
         WHERE assignment_id = $1 AND student_id = $2`,
        [assignmentId, user.userId],
      );

      if (sub) {
        const evaluations = await this.db.query(
          `SELECT re.rubric_id, ar.criterion_name, ar.max_points,
                  re.points_awarded, re.feedback
           FROM rubric_evaluations re
           JOIN assignment_rubrics ar ON re.rubric_id = ar.id
           WHERE re.submission_id = $1`,
          [sub.id],
        );

        mySubmission = {
          ...sub,
          totalScore: sub.total_score !== null ? Number(sub.total_score) : null,
          rubricEvaluations: evaluations.map((e) => ({
            rubricId: e.rubric_id,
            criterionName: e.criterion_name,
            maxPoints: Number(e.max_points),
            pointsAwarded: Number(e.points_awarded),
            feedback: e.feedback,
          })),
        };
      }
    }

    const allowedFileTypes =
      typeof ctx.allowed_file_types === 'string'
        ? JSON.parse(ctx.allowed_file_types)
        : ctx.allowed_file_types;

    return {
      success: true,
      data: {
        id: ctx.assignment_id,
        title: ctx.title,
        description: ctx.description,
        allowedFileTypes,
        maxFileSizeMb: ctx.max_file_size_mb,
        dueDate: ctx.due_date,
        totalPoints: Number(ctx.total_points),
        passScore: Number(ctx.pass_score),
        lesson: { id: ctx.lesson_id, title: ctx.lesson_title },
        course: { id: ctx.course_id, title: ctx.course_title },
        rubrics: rubrics.map((r) => ({
          id: r.id,
          criterionName: r.criterion_name,
          description: r.description,
          maxPoints: Number(r.max_points),
          orderIndex: r.order_index,
          levels: typeof r.levels === 'string' ? JSON.parse(r.levels) : r.levels,
        })),
        mySubmission,
      },
    };
  }

  async updateAssignment(
    assignmentId: string,
    dto: UpdateAssignmentDto,
    user: CurrentUserPayload,
  ) {
    const ctx = await this.getAssignmentContext(assignmentId);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(dto.title.trim());
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(dto.description.trim());
    }
    if (dto.allowedFileTypes !== undefined) {
      fields.push(`allowed_file_types = $${idx++}`);
      values.push(JSON.stringify(dto.allowedFileTypes));
    }
    if (dto.maxFileSizeMb !== undefined) {
      fields.push(`max_file_size_mb = $${idx++}`);
      values.push(dto.maxFileSizeMb);
    }
    if (dto.dueDate !== undefined) {
      fields.push(`due_date = $${idx++}`);
      values.push(dto.dueDate ? new Date(dto.dueDate) : null);
    }
    if (dto.totalPoints !== undefined) {
      fields.push(`total_points = $${idx++}`);
      values.push(dto.totalPoints);
    }
    if (dto.passScore !== undefined) {
      fields.push(`pass_score = $${idx++}`);
      values.push(dto.passScore);
    }

    if (fields.length === 0) {
      throw new BadRequestException('Không có trường nào để cập nhật');
    }

    fields.push(`updated_at = NOW()`);
    values.push(assignmentId);

    const updated = await this.db.queryOne(
      `UPDATE assignments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    return {
      success: true,
      message: 'Cập nhật bài tập thành công',
      data: updated,
    };
  }

  async deleteAssignment(assignmentId: string, user: CurrentUserPayload) {
    const ctx = await this.getAssignmentContext(assignmentId);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    await this.db.query('DELETE FROM assignments WHERE id = $1', [assignmentId]);
    return {
      success: true,
      message: 'Xóa bài tập thành công',
    };
  }

  // ---------------------------------------------------------------------------
  // 2. Quản lý Tiêu chí Rubric (Rubric Criteria)
  // ---------------------------------------------------------------------------
  async addRubric(
    assignmentId: string,
    dto: CreateRubricDto,
    user: CurrentUserPayload,
  ) {
    const ctx = await this.getAssignmentContext(assignmentId);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    let order = dto.orderIndex;
    if (order === undefined || order === null) {
      const maxOrder = await this.db.queryOne<{ max_order: number | null }>(
        'SELECT MAX(order_index) as max_order FROM assignment_rubrics WHERE assignment_id = $1',
        [assignmentId],
      );
      order = (maxOrder?.max_order ?? 0) + 1;
    }

    const created = await this.db.queryOne(
      `INSERT INTO assignment_rubrics (assignment_id, criterion_name, description, max_points, order_index, levels)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        assignmentId,
        dto.criterionName.trim(),
        dto.description || null,
        dto.maxPoints,
        order,
        JSON.stringify(dto.levels || []),
      ],
    );

    return {
      success: true,
      message: 'Thêm tiêu chí rubric thành công',
      data: {
        ...created,
        maxPoints: Number(created.max_points),
      },
    };
  }

  async updateRubric(
    rubricId: string,
    dto: UpdateRubricDto,
    user: CurrentUserPayload,
  ) {
    const rub = await this.db.queryOne<{ assignment_id: string }>(
      'SELECT assignment_id FROM assignment_rubrics WHERE id = $1',
      [rubricId],
    );
    if (!rub) throw new NotFoundException('Không tìm thấy tiêu chí rubric');

    const ctx = await this.getAssignmentContext(rub.assignment_id);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.criterionName !== undefined) {
      fields.push(`criterion_name = $${idx++}`);
      values.push(dto.criterionName.trim());
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(dto.description);
    }
    if (dto.maxPoints !== undefined) {
      fields.push(`max_points = $${idx++}`);
      values.push(dto.maxPoints);
    }
    if (dto.orderIndex !== undefined) {
      fields.push(`order_index = $${idx++}`);
      values.push(dto.orderIndex);
    }
    if (dto.levels !== undefined) {
      fields.push(`levels = $${idx++}`);
      values.push(JSON.stringify(dto.levels));
    }

    if (fields.length === 0) {
      throw new BadRequestException('Không có trường nào để cập nhật');
    }

    values.push(rubricId);
    const updated = await this.db.queryOne(
      `UPDATE assignment_rubrics SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    return {
      success: true,
      message: 'Cập nhật tiêu chí rubric thành công',
      data: {
        ...updated,
        maxPoints: Number(updated.max_points),
      },
    };
  }

  async deleteRubric(rubricId: string, user: CurrentUserPayload) {
    const rub = await this.db.queryOne<{ assignment_id: string }>(
      'SELECT assignment_id FROM assignment_rubrics WHERE id = $1',
      [rubricId],
    );
    if (!rub) throw new NotFoundException('Không tìm thấy tiêu chí rubric');

    const ctx = await this.getAssignmentContext(rub.assignment_id);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    await this.db.query('DELETE FROM assignment_rubrics WHERE id = $1', [rubricId]);
    return {
      success: true,
      message: 'Xóa tiêu chí rubric thành công',
    };
  }

  // ---------------------------------------------------------------------------
  // 3. Học viên: Nộp file bài tập (File Submission)
  // ---------------------------------------------------------------------------
  async submitAssignment(
    assignmentId: string,
    file: Express.Multer.File | undefined,
    dto: SubmitAssignmentDto,
    user: CurrentUserPayload,
  ) {
    if (user.role !== Role.STUDENT && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Chỉ học viên mới có thể nộp bài tập');
    }

    const ctx = await this.getAssignmentContext(assignmentId);

    // Kiểm tra đăng ký khóa học
    if (user.role === Role.STUDENT) {
      const enrollment = await this.db.queryOne<{ id: string; status: string }>(
        `SELECT id, status FROM enrollments
         WHERE student_id = $1 AND course_id = $2 AND status = 'active'`,
        [user.userId, ctx.course_id],
      );
      if (!enrollment) {
        throw new ForbiddenException('Học viên chưa đăng ký hoặc chưa kích hoạt khóa học này');
      }
    }

    let fileUrl: string;
    let originalFilename: string;
    let fileSizeBytes: number;
    let mimeType: string;

    const allowedTypes =
      typeof ctx.allowed_file_types === 'string'
        ? JSON.parse(ctx.allowed_file_types)
        : ctx.allowed_file_types;
    const allowedExts: string[] = Array.isArray(allowedTypes)
      ? allowedTypes.map((e) => e.toLowerCase())
      : ['zip', 'pdf', 'tar.gz'];

    if (file) {
      // 1. Nộp bài trực tiếp qua Multipart File Upload
      originalFilename = file.originalname;
      fileSizeBytes = file.size;
      mimeType = file.mimetype;

      const ext = path.extname(originalFilename).replace('.', '').toLowerCase();
      if (!allowedExts.includes(ext)) {
        // Xóa file tạm nếu có lưu trên đĩa
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new BadRequestException(
          `Định dạng file .${ext} không được phép. Các định dạng chấp nhận: ${allowedExts.join(', ')}`,
        );
      }

      const maxBytes = ctx.max_file_size_mb * 1024 * 1024;
      if (fileSizeBytes > maxBytes) {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new BadRequestException(
          `Dung lượng file (${(fileSizeBytes / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn cho phép (${ctx.max_file_size_mb}MB)`,
        );
      }

      fileUrl = file.filename
        ? `/uploads/assignments/${file.filename}`
        : `/uploads/assignments/${originalFilename}`;
    } else if (dto.fileUrl) {
      // 2. Nộp bài qua URL (Cloud storage / drive link)
      fileUrl = dto.fileUrl.trim();
      originalFilename = dto.originalFilename || path.basename(fileUrl) || 'submission_file';
      fileSizeBytes = dto.fileSizeBytes || 0;
      mimeType = dto.mimeType || 'application/octet-stream';

      const ext = path.extname(originalFilename).replace('.', '').toLowerCase();
      if (ext && !allowedExts.includes(ext)) {
        throw new BadRequestException(
          `Định dạng file .${ext} không được phép. Các định dạng chấp nhận: ${allowedExts.join(', ')}`,
        );
      }
    } else {
      throw new BadRequestException('Vui lòng upload file đính kèm hoặc cung cấp đường dẫn fileUrl');
    }

    // Kiểm tra hạn nộp bài (due_date)
    const now = new Date();
    const isLate = ctx.due_date ? now.getTime() > new Date(ctx.due_date).getTime() : false;

    // Lưu bài nộp (hỗ trợ nộp lại / resubmitted nếu đã nộp trước đó)
    const existing = await this.db.queryOne(
      'SELECT id, status FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignmentId, user.userId],
    );

    let savedSubmission: any;
    if (existing) {
      savedSubmission = await this.db.queryOne(
        `UPDATE assignment_submissions
         SET file_url = $1, original_filename = $2, file_size_bytes = $3,
             mime_type = $4, notes = $5, status = 'resubmitted', is_late = $6,
             submitted_at = NOW(), updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [
          fileUrl,
          originalFilename,
          fileSizeBytes,
          mimeType,
          dto.notes || null,
          isLate,
          existing.id,
        ],
      );
    } else {
      savedSubmission = await this.db.queryOne(
        `INSERT INTO assignment_submissions (assignment_id, student_id, file_url, original_filename, file_size_bytes, mime_type, notes, status, is_late, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted', $8, NOW())
         RETURNING *`,
        [
          assignmentId,
          user.userId,
          fileUrl,
          originalFilename,
          fileSizeBytes,
          mimeType,
          dto.notes || null,
          isLate,
        ],
      );
    }

    return {
      success: true,
      message: isLate
        ? 'Nộp bài tập thành công (CẢNH BÁO: Bài nộp quá hạn chót quy định)'
        : 'Nộp bài tập thành công',
      data: {
        id: savedSubmission.id,
        assignmentId,
        title: ctx.title,
        originalFilename,
        fileUrl,
        fileSizeBytes,
        isLate,
        status: savedSubmission.status,
        submittedAt: savedSubmission.submitted_at,
        notes: dto.notes || null,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // 4. Giảng viên: Chấm điểm bài tập theo Rubric (Rubric-based Grading)
  // ---------------------------------------------------------------------------
  async gradeSubmission(
    submissionId: string,
    dto: GradeSubmissionDto,
    user: CurrentUserPayload,
  ) {
    // Lấy bài nộp và ngữ cảnh bài tập
    const sub = await this.db.queryOne<{
      submission_id: string;
      assignment_id: string;
      student_id: string;
      lesson_id: string;
      course_id: string;
      instructor_id: string;
      pass_score: number;
      total_points: number;
    }>(
      `SELECT s.id AS submission_id, s.assignment_id, s.student_id,
              a.lesson_id, a.pass_score, a.total_points,
              c.id AS course_id, c.instructor_id
       FROM assignment_submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN lessons l ON a.lesson_id = l.id
       JOIN sections sec ON l.section_id = sec.id
       JOIN courses c ON sec.course_id = c.id
       WHERE s.id = $1`,
      [submissionId],
    );

    if (!sub) {
      throw new NotFoundException(`Không tìm thấy bài nộp với ID: ${submissionId}`);
    }

    const isAdmin = user.role === Role.ADMIN;
    const isOwner = user.userId === sub.instructor_id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền chấm điểm bài tập này');
    }

    // Lấy danh sách tiêu chí rubric của bài tập này
    const rubrics = await this.db.query<{
      id: string;
      criterion_name: string;
      max_points: number;
    }>(
      `SELECT id, criterion_name, max_points
       FROM assignment_rubrics
       WHERE assignment_id = $1`,
      [sub.assignment_id],
    );

    const rubricMap = new Map(rubrics.map((r) => [r.id, r]));

    // Xác thực từng tiêu chí được chấm
    for (const item of dto.evaluations) {
      const rub = rubricMap.get(item.rubricId);
      if (!rub) {
        throw new BadRequestException(
          `Tiêu chí rubric với ID ${item.rubricId} không thuộc bài tập này`,
        );
      }
      if (item.pointsAwarded > Number(rub.max_points)) {
        throw new BadRequestException(
          `Điểm chấm cho tiêu chí "${rub.criterion_name}" (${item.pointsAwarded}) vượt quá điểm tối đa cho phép (${rub.max_points})`,
        );
      }
    }

    // Thực hiện lưu điểm theo rubric trong transaction
    return this.db.transaction(async (client) => {
      // Xóa đánh giá rubric cũ nếu đã chấm trước đó
      await client.query(
        'DELETE FROM rubric_evaluations WHERE submission_id = $1',
        [submissionId],
      );

      let totalScore = 0;
      const evaluationDetails: any[] = [];

      for (const item of dto.evaluations) {
        const rub = rubricMap.get(item.rubricId)!;
        const awarded = Number(item.pointsAwarded);
        totalScore += awarded;

        const evalRes = await client.query(
          `INSERT INTO rubric_evaluations (submission_id, rubric_id, points_awarded, feedback)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [submissionId, item.rubricId, awarded, item.feedback || null],
        );

        evaluationDetails.push({
          rubricId: item.rubricId,
          criterionName: rub.criterion_name,
          maxPoints: Number(rub.max_points),
          pointsAwarded: awarded,
          feedback: item.feedback || null,
        });
      }

      totalScore = Math.round(totalScore * 100) / 100;
      const passScore = Number(sub.pass_score);
      const isPassed = totalScore >= passScore;

      // Cập nhật trạng thái và điểm bài nộp
      const updatedSub = await client.query(
        `UPDATE assignment_submissions
         SET total_score = $1, status = 'graded', feedback = $2,
             graded_by = $3, graded_at = NOW(), updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [totalScore, dto.generalFeedback || null, user.userId, submissionId],
      );

      // Nếu học viên ĐẠT bài tập -> Cập nhật hoàn thành bài học trong progress_records
      if (isPassed) {
        await client.query(
          `INSERT INTO progress_records (enrollment_id, lesson_id, is_completed, last_position_seconds, updated_at)
           SELECT e.id, $2, true, 0, NOW()
           FROM enrollments e
           WHERE e.student_id = $1 AND e.course_id = $3
           ON CONFLICT (enrollment_id, lesson_id)
           DO UPDATE SET is_completed = true, updated_at = NOW()`,
          [sub.student_id, sub.lesson_id, sub.course_id],
        );
      }

      return {
        success: true,
        message: 'Chấm điểm bài tập theo rubric thành công',
        data: {
          submissionId,
          studentId: sub.student_id,
          totalScore,
          maxPoints: Number(sub.total_points),
          passScore,
          isPassed,
          generalFeedback: dto.generalFeedback || null,
          gradedAt: updatedSub.rows[0].graded_at,
          evaluations: evaluationDetails,
        },
      };
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Danh sách bài nộp & Chi tiết bài nộp của học viên
  // ---------------------------------------------------------------------------
  async getAssignmentSubmissions(
    assignmentId: string,
    user: CurrentUserPayload,
  ) {
    const ctx = await this.getAssignmentContext(assignmentId);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    const submissions = await this.db.query(
      `SELECT s.id, s.student_id, u.full_name AS student_name, u.email AS student_email,
              s.file_url, s.original_filename, s.file_size_bytes, s.notes,
              s.status, s.total_score, s.is_late, s.feedback, s.submitted_at, s.graded_at
       FROM assignment_submissions s
       JOIN users u ON s.student_id = u.id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
      [assignmentId],
    );

    const totalSubmissions = submissions.length;
    const gradedCount = submissions.filter((s) => s.status === 'graded').length;
    const pendingCount = totalSubmissions - gradedCount;
    const lateCount = submissions.filter((s) => s.is_late).length;

    let scoreSum = 0;
    for (const sub of submissions) {
      if (sub.total_score !== null) {
        scoreSum += Number(sub.total_score);
      }
    }
    const averageScore =
      gradedCount > 0 ? Math.round((scoreSum / gradedCount) * 100) / 100 : 0;

    return {
      success: true,
      data: {
        assignmentId,
        title: ctx.title,
        dueDate: ctx.due_date,
        totalPoints: Number(ctx.total_points),
        passScore: Number(ctx.pass_score),
        stats: {
          totalSubmissions,
          gradedCount,
          pendingCount,
          lateCount,
          averageScore,
        },
        submissions: submissions.map((s) => ({
          id: s.id,
          student: {
            id: s.student_id,
            fullName: s.student_name,
            email: s.student_email,
          },
          fileUrl: s.file_url,
          originalFilename: s.original_filename,
          fileSizeBytes: Number(s.file_size_bytes),
          status: s.status,
          totalScore: s.total_score !== null ? Number(s.total_score) : null,
          isLate: s.is_late,
          feedback: s.feedback,
          submittedAt: s.submitted_at,
          gradedAt: s.graded_at,
        })),
      },
    };
  }

  async getMySubmission(assignmentId: string, user: CurrentUserPayload) {
    const ctx = await this.getAssignmentContext(assignmentId);

    const sub = await this.db.queryOne(
      `SELECT id, file_url, original_filename, file_size_bytes, mime_type, notes,
              status, total_score, is_late, feedback, submitted_at, graded_at
       FROM assignment_submissions
       WHERE assignment_id = $1 AND student_id = $2`,
      [assignmentId, user.userId],
    );

    if (!sub) {
      return {
        success: true,
        data: null,
      };
    }

    const evaluations = await this.db.query(
      `SELECT re.rubric_id, ar.criterion_name, ar.max_points,
              re.points_awarded, re.feedback
       FROM rubric_evaluations re
       JOIN assignment_rubrics ar ON re.rubric_id = ar.id
       WHERE re.submission_id = $1
       ORDER BY ar.order_index ASC`,
      [sub.id],
    );

    return {
      success: true,
      data: {
        ...sub,
        totalScore: sub.total_score !== null ? Number(sub.total_score) : null,
        passScore: Number(ctx.pass_score),
        isPassed:
          sub.total_score !== null ? Number(sub.total_score) >= Number(ctx.pass_score) : null,
        rubricEvaluations: evaluations.map((e) => ({
          rubricId: e.rubric_id,
          criterionName: e.criterion_name,
          maxPoints: Number(e.max_points),
          pointsAwarded: Number(e.points_awarded),
          feedback: e.feedback,
        })),
      },
    };
  }
}
