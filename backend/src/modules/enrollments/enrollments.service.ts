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
      throw new ForbiddenException('Chỉ học viên mới có thể thực hiện thao tác này');
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

    const existing = await this.db.queryOne<{
      id: string;
      student_id: string;
      course_id: string;
      status: string;
      enrolled_at: Date;
    }>(
      'SELECT id, student_id, course_id, status, enrolled_at FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [user.userId, courseId],
    );

    if (existing) {
      if (existing.status === 'suspended') {
        throw new ForbiddenException('Đăng ký của bạn ở khóa học này đã bị tạm dừng');
      }
      if (existing.status === 'active') {
        return {
          success: true,
          message: 'Bạn đã đăng ký khóa học này',
          data: { ...existing, course: { id: course.id, title: course.title } },
        };
      }
      if (existing.status === 'completed') {
        return {
          success: true,
          message: 'Bạn đã hoàn thành khóa học này',
          data: { ...existing, course: { id: course.id, title: course.title } },
        };
      }
      if (existing.status === 'cancelled') {
        const reactivated = await this.db.queryOne(
          `UPDATE enrollments
           SET status = 'active', enrolled_at = NOW()
           WHERE id = $1
           RETURNING id, student_id, course_id, status, enrolled_at`,
          [existing.id],
        );
        return {
          success: true,
          message: 'Đăng ký lại khóa học thành công',
          data: { ...reactivated, course: { id: course.id, title: course.title } },
        };
      }
    }

    const inserted = await this.db.queryOne(
      `INSERT INTO enrollments (student_id, course_id, status, enrolled_at)
       VALUES ($1, $2, 'active', NOW())
       RETURNING id, student_id, course_id, status, enrolled_at`,
      [user.userId, courseId],
    );

    return {
      success: true,
      message: 'Đăng ký khóa học thành công',
      data: { ...inserted, course: { id: course.id, title: course.title } },
    };
  }

  async findMine(user: CurrentUserPayload) {
    this.ensureStudent(user);
    const enrollments = await this.db.query(
      `SELECT e.id, e.status, e.enrolled_at,
              c.id AS course_id, c.code AS course_code,
              c.title AS course_title, c.description AS course_description,
              c.thumbnail_url, c.category, c.level,
              u.id AS instructor_id, u.full_name AS instructor_name,
              COUNT(DISTINCT l.id)::int AS total_lessons,
              COUNT(DISTINCT l.id) FILTER (WHERE pr.is_completed)::int AS completed_lessons,
              MAX(pr.updated_at) AS last_activity_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN users u ON u.id = c.instructor_id
       LEFT JOIN sections s ON s.course_id = c.id
       LEFT JOIN lessons l ON l.section_id = s.id
       LEFT JOIN progress_records pr ON pr.enrollment_id = e.id AND pr.lesson_id = l.id
       WHERE e.student_id = $1
       GROUP BY e.id, c.id, u.id
       ORDER BY e.enrolled_at DESC`,
      [user.userId],
    );

    return {
      success: true,
      data: enrollments.map((row) => ({
        id: row.id,
        status: row.status,
        enrolledAt: row.enrolled_at,
        lastActivityAt: row.last_activity_at || null,
        course: {
          id: row.course_id,
          code: row.course_code,
          title: row.course_title,
          description: row.course_description,
          thumbnailUrl: row.thumbnail_url,
          category: row.category,
          level: row.level,
          instructor: {
            id: row.instructor_id,
            fullName: row.instructor_name,
          },
        },
        progress: this.progressSummary(row.total_lessons, row.completed_lessons),
      })),
    };
  }

  async getEnrollmentByCourse(courseId: string, user: CurrentUserPayload) {
    this.ensureStudent(user);
    const enrollment = await this.db.queryOne<{
      id: string;
      student_id: string;
      course_id: string;
      status: string;
      enrolled_at: Date;
    }>(
      `SELECT id, student_id, course_id, status, enrolled_at
       FROM enrollments WHERE course_id = $1 AND student_id = $2`,
      [courseId, user.userId],
    );

    if (!enrollment) {
      return {
        success: true,
        isEnrolled: false,
        data: null,
      };
    }

    return {
      success: true,
      isEnrolled: enrollment.status === 'active' || enrollment.status === 'completed',
      data: enrollment,
    };
  }

  async getProgressByCourse(courseId: string, user: CurrentUserPayload) {
    this.ensureStudent(user);
    const enrollment = await this.db.queryOne<{ id: string }>(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [courseId, user.userId],
    );
    if (!enrollment) {
      throw new NotFoundException('Bạn chưa đăng ký khóa học này');
    }
    return this.getProgress(enrollment.id, user);
  }

  async getProgress(enrollmentId: string, user: CurrentUserPayload) {
    this.ensureStudent(user);
    const enrollment = await this.getOwnedEnrollment(enrollmentId, user.userId);
    const lessons = await this.db.query(
      `SELECT l.id AS lesson_id, l.title AS lesson_title, l.content_type, l.duration_minutes,
              l.order_index AS lesson_order, s.id AS section_id, s.title AS section_title,
              s.order_index AS section_order, pr.is_completed,
              pr.last_position_seconds, pr.updated_at AS progress_updated_at
       FROM sections s
       JOIN lessons l ON l.section_id = s.id
       LEFT JOIN progress_records pr ON pr.enrollment_id = $1 AND pr.lesson_id = l.id
       WHERE s.course_id = $2
       ORDER BY s.order_index ASC, l.order_index ASC`,
      [enrollmentId, enrollment.course_id],
    );

    const completed = lessons.filter((lesson) => lesson.is_completed).length;

    // Resume point selection:
    // 1. In-progress lesson with saved position
    // 2. Or the first incomplete lesson
    // 3. Or first lesson if none
    let resumeLesson = lessons.find((l) => !l.is_completed && (l.last_position_seconds ?? 0) > 0);
    if (!resumeLesson) {
      resumeLesson = lessons.find((l) => !l.is_completed) || lessons[0] || null;
    }

    return {
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolled_at,
        },
        summary: this.progressSummary(lessons.length, completed),
        resumeLesson: resumeLesson
          ? {
              lessonId: resumeLesson.lesson_id,
              sectionId: resumeLesson.section_id,
              title: resumeLesson.lesson_title,
              lastPositionSeconds: resumeLesson.last_position_seconds ?? 0,
            }
          : null,
        lessons: lessons.map((lesson) => ({
          id: lesson.lesson_id,
          title: lesson.lesson_title,
          contentType: lesson.content_type,
          durationMinutes: lesson.duration_minutes ?? 0,
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
        `INSERT INTO progress_records (enrollment_id, lesson_id, is_completed, last_position_seconds, updated_at)
         VALUES ($1, $2, COALESCE($3, FALSE), COALESCE($4, 0), NOW())
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
      } else if (enrollmentRow.status === 'completed' && completed < total) {
        await client.query("UPDATE enrollments SET status = 'active' WHERE id = $1 AND status = 'completed'", [enrollmentId]);
      }

      return {
        success: true,
        message: 'Cập nhật tiến độ bài học thành công',
        data: {
          id: updated.rows[0].id,
          enrollmentId: updated.rows[0].enrollment_id,
          lessonId: updated.rows[0].lesson_id,
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

  async getCourseEnrollments(courseId: string, user: CurrentUserPayload) {
    const course = await this.db.queryOne<{ id: string; instructor_id: string }>(
      'SELECT id, instructor_id FROM courses WHERE id = $1',
      [courseId],
    );
    if (!course) throw new NotFoundException('Không tìm thấy khóa học');

    if (user.role === Role.INSTRUCTOR && course.instructor_id !== user.userId) {
      throw new ForbiddenException('Bạn không phải giảng viên phụ trách khóa học này');
    }

    const enrollments = await this.db.query(
      `SELECT e.id, e.status, e.enrolled_at,
              u.id AS student_id, u.full_name AS student_name, u.email AS student_email, u.avatar_url AS student_avatar,
              COUNT(DISTINCT l.id)::int AS total_lessons,
              COUNT(DISTINCT l.id) FILTER (WHERE pr.is_completed)::int AS completed_lessons,
              MAX(pr.updated_at) AS last_activity_at
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       LEFT JOIN sections s ON s.course_id = e.course_id
       LEFT JOIN lessons l ON l.section_id = s.id
       LEFT JOIN progress_records pr ON pr.enrollment_id = e.id AND pr.lesson_id = l.id
       WHERE e.course_id = $1
       GROUP BY e.id, u.id
       ORDER BY e.enrolled_at DESC`,
      [courseId],
    );

    return {
      success: true,
      data: enrollments.map((r) => ({
        id: r.id,
        status: r.status,
        enrolledAt: r.enrolled_at,
        lastActivityAt: r.last_activity_at || null,
        student: {
          id: r.student_id,
          fullName: r.student_name,
          email: r.student_email,
          avatarUrl: r.student_avatar,
        },
        progress: this.progressSummary(r.total_lessons, r.completed_lessons),
      })),
    };
  }

  private async getOwnedEnrollment(enrollmentId: string, userId: string) {
    const enrollment = await this.db.queryOne<{
      id: string;
      student_id: string;
      course_id: string;
      status: string;
      enrolled_at: Date;
    }>(
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
