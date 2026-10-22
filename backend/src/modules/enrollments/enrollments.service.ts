import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles.enum';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly db: DatabaseService) {}

  private ensureStudent(user: CurrentUserPayload) {
    if (user.role !== Role.STUDENT) {
      throw new ForbiddenException('Chỉ học viên mới có thể đăng ký và cập nhật tiến độ');
    }
  }

  async enroll(courseId: string, user: CurrentUserPayload) {
    this.ensureStudent(user);

    const course = await this.db.queryOne<{ id: string; title: string; is_published: boolean }>(
      'SELECT id, title, is_published FROM courses WHERE id = $1',
      [courseId],
    );
    if (!course) throw new NotFoundException('Không tìm thấy khóa học');
    if (!course.is_published) throw new ConflictException('Không thể đăng ký khóa học chưa xuất bản');

    const inserted = await this.db.queryOne(
      `INSERT INTO enrollments (student_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (student_id, course_id) DO UPDATE
         SET status = 'active', enrolled_at = NOW()
         WHERE enrollments.status = 'cancelled'
       RETURNING id, student_id, course_id, status, enrolled_at`,
      [user.userId, courseId],
    );
    const enrollment = inserted ?? await this.db.queryOne(
      `SELECT id, student_id, course_id, status, enrolled_at
       FROM enrollments WHERE student_id = $1 AND course_id = $2`,
      [user.userId, courseId],
    );

    return {
      success: true,
      message: inserted ? 'Đăng ký khóa học thành công' : 'Bạn đã đăng ký khóa học này',
      data: { ...enrollment, course: { id: course.id, title: course.title } },
    };
  }

  async findMine(user: CurrentUserPayload) {
    this.ensureStudent(user);
    const enrollments = await this.db.query(
      `SELECT e.id, e.status, e.enrolled_at, c.id AS course_id, c.code AS course_code,
              c.title AS course_title, c.description AS course_description,
              COUNT(l.id)::int AS total_lessons,
              COUNT(l.id) FILTER (WHERE pr.is_completed)::int AS completed_lessons
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN sections s ON s.course_id = c.id
       LEFT JOIN lessons l ON l.section_id = s.id
       LEFT JOIN progress_records pr ON pr.enrollment_id = e.id AND pr.lesson_id = l.id
       WHERE e.student_id = $1
       GROUP BY e.id, c.id
       ORDER BY e.enrolled_at DESC`,
      [user.userId],
    );

    return {
      success: true,
      data: enrollments.map((row) => ({
        id: row.id,
        status: row.status,
        enrolledAt: row.enrolled_at,
        course: {
          id: row.course_id,
          code: row.course_code,
          title: row.course_title,
          description: row.course_description,
        },
        progress: this.progressSummary(row.total_lessons, row.completed_lessons),
      })),
    };
  }

  async getProgress(enrollmentId: string, user: CurrentUserPayload) {
    this.ensureStudent(user);
    const enrollment = await this.getOwnedEnrollment(enrollmentId, user.userId);
    const lessons = await this.db.query(
      `SELECT l.id AS lesson_id, l.title AS lesson_title, l.content_type,
              l.order_index AS lesson_order, s.id AS section_id, s.title AS section_title,
              s.order_index AS section_order, pr.is_completed,
              pr.last_position_seconds, pr.updated_at AS progress_updated_at
       FROM lessons l
       JOIN sections s ON s.id = l.section_id
       LEFT JOIN progress_records pr ON pr.enrollment_id = $1 AND pr.lesson_id = l.id
       WHERE s.course_id = $2
       ORDER BY s.order_index, l.order_index`,
      [enrollmentId, enrollment.course_id],
    );

    const completed = lessons.filter((lesson) => lesson.is_completed).length;
    return {
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolled_at,
        },
        summary: this.progressSummary(lessons.length, completed),
        lessons: lessons.map((lesson) => ({
          id: lesson.lesson_id,
          title: lesson.lesson_title,
          contentType: lesson.content_type,
          orderIndex: lesson.lesson_order,
          section: {
            id: lesson.section_id,
            title: lesson.section_title,
            orderIndex: lesson.section_order,
          },
          progress: {
            isCompleted: lesson.is_completed ?? false,
            lastPositionSeconds: lesson.last_position_seconds ?? 0,
            updatedAt: lesson.progress_updated_at ?? null,
          },
        })),
      },
    };
  }

  async updateProgress(
    enrollmentId: string,
    lessonId: string,
    dto: UpdateLessonProgressDto,
    user: CurrentUserPayload,
  ) {
    this.ensureStudent(user);
    if (dto.isCompleted === undefined && dto.lastPositionSeconds === undefined) {
      throw new BadRequestException('Cần cung cấp isCompleted hoặc lastPositionSeconds');
    }

    return this.db.transaction(async (client) => {
      const enrollment = await client.query(
        `SELECT e.id, e.course_id, e.status
         FROM enrollments e
         WHERE e.id = $1 AND e.student_id = $2
         FOR UPDATE`,
        [enrollmentId, user.userId],
      );
      if (!enrollment.rows[0]) {
        const exists = await client.query('SELECT id FROM enrollments WHERE id = $1', [enrollmentId]);
        if (exists.rows[0]) throw new ForbiddenException('Bạn không có quyền truy cập đăng ký này');
        throw new NotFoundException('Không tìm thấy đăng ký khóa học');
      }
      const enrollmentRow = enrollment.rows[0];
      if (enrollmentRow.status !== 'active' && enrollmentRow.status !== 'completed') {
        throw new ConflictException('Đăng ký này không còn hoạt động');
      }

      const lesson = await client.query(
        `SELECT l.id FROM lessons l
         JOIN sections s ON s.id = l.section_id
         WHERE l.id = $1 AND s.course_id = $2`,
        [lessonId, enrollmentRow.course_id],
      );
      if (!lesson.rows[0]) throw new NotFoundException('Bài học không thuộc khóa học đã đăng ký');

      const updated = await client.query(
        `INSERT INTO progress_records (enrollment_id, lesson_id, is_completed, last_position_seconds)
         VALUES ($1, $2, COALESCE($3, FALSE), COALESCE($4, 0))
         ON CONFLICT (enrollment_id, lesson_id) DO UPDATE SET
           is_completed = COALESCE($3, progress_records.is_completed),
           last_position_seconds = COALESCE($4, progress_records.last_position_seconds),
           updated_at = NOW()
         RETURNING id, enrollment_id, lesson_id, is_completed,
                   last_position_seconds, updated_at`,
        [enrollmentId, lessonId, dto.isCompleted ?? null, dto.lastPositionSeconds ?? null],
      );

      const totals = await client.query(
        `SELECT COUNT(l.id)::int AS total,
                COUNT(l.id) FILTER (WHERE pr.is_completed)::int AS completed
         FROM sections s
         JOIN lessons l ON l.section_id = s.id
         LEFT JOIN progress_records pr ON pr.enrollment_id = $1 AND pr.lesson_id = l.id
         WHERE s.course_id = $2`,
        [enrollmentId, enrollmentRow.course_id],
      );
      const { total, completed } = totals.rows[0];
      if (total > 0 && completed === total) {
        await client.query("UPDATE enrollments SET status = 'completed' WHERE id = $1 AND status = 'active'", [enrollmentId]);
      } else if (enrollmentRow.status === 'completed') {
        await client.query("UPDATE enrollments SET status = 'active' WHERE id = $1 AND status = 'completed'", [enrollmentId]);
      }

      return {
        success: true,
        data: {
          ...updated.rows[0],
          isCompleted: updated.rows[0].is_completed,
          lastPositionSeconds: updated.rows[0].last_position_seconds,
          updatedAt: updated.rows[0].updated_at,
          summary: this.progressSummary(total, completed),
        },
      };
    });
  }

  async cancel(enrollmentId: string, user: CurrentUserPayload) {
    this.ensureStudent(user);
    const enrollment = await this.getOwnedEnrollment(enrollmentId, user.userId);
    if (enrollment.status === 'cancelled') {
      return { success: true, message: 'Đăng ký đã được hủy', data: enrollment };
    }
    if (enrollment.status === 'completed') {
      throw new ConflictException('Không thể hủy đăng ký đã hoàn thành');
    }
    const cancelled = await this.db.queryOne(
      `UPDATE enrollments SET status = 'cancelled'
       WHERE id = $1 AND student_id = $2
       RETURNING id, student_id, course_id, status, enrolled_at`,
      [enrollmentId, user.userId],
    );
    return { success: true, message: 'Đã hủy đăng ký khóa học', data: cancelled };
  }

  private async getOwnedEnrollment(enrollmentId: string, userId: string) {
    const enrollment = await this.db.queryOne(
      `SELECT id, student_id, course_id, status, enrolled_at
       FROM enrollments WHERE id = $1 AND student_id = $2`,
      [enrollmentId, userId],
    );
    if (enrollment) return enrollment;

    const exists = await this.db.queryOne('SELECT id FROM enrollments WHERE id = $1', [enrollmentId]);
    if (exists) throw new ForbiddenException('Bạn không có quyền truy cập đăng ký này');
    throw new NotFoundException('Không tìm thấy đăng ký khóa học');
  }

  private progressSummary(totalLessons: number, completedLessons: number) {
    return {
      totalLessons: Number(totalLessons),
      completedLessons: Number(completedLessons),
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    };
  }
}
