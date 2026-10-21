import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles.enum';

@Injectable()
export class LessonsService {
  constructor(private db: DatabaseService) {}

  private async verifySectionOwnership(sectionId: string, currentUser: CurrentUserPayload) {
    const res = await this.db.queryOne(
      `SELECT s.id as section_id, s.course_id, c.instructor_id, c.title as course_title
       FROM sections s
       JOIN courses c ON s.course_id = c.id
       WHERE s.id = $1`,
      [sectionId],
    );

    if (!res) {
      throw new NotFoundException(`Không tìm thấy chương mục với ID: ${sectionId}`);
    }

    const isAdmin = currentUser.role === Role.ADMIN;
    const isOwner = currentUser.userId === res.instructor_id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa nội dung khóa học này');
    }

    return res;
  }

  async create(sectionId: string, dto: CreateLessonDto, currentUser: CurrentUserPayload) {
    await this.verifySectionOwnership(sectionId, currentUser);

    let orderIndex = dto.orderIndex;
    if (orderIndex === undefined || orderIndex === null) {
      const maxOrder = await this.db.queryOne<{ max_order: number | null }>(
        'SELECT MAX(order_index) as max_order FROM lessons WHERE section_id = $1',
        [sectionId],
      );
      orderIndex = (maxOrder?.max_order ?? 0) + 1;
    }

    const newLesson = await this.db.queryOne(
      `INSERT INTO lessons (section_id, title, content_type, duration_minutes, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        sectionId,
        dto.title.trim(),
        dto.contentType,
        dto.durationMinutes || 0,
        orderIndex,
      ],
    );

    if (!newLesson) {
      throw new InternalServerErrorException('Không thể tạo bài học');
    }

    return {
      success: true,
      message: 'Tạo bài học thành công',
      data: newLesson,
    };
  }

  async findById(id: string, currentUser: CurrentUserPayload) {
    // 1. Fetch lesson with section and course info
    const lessonSql = `
      SELECT 
        l.id, l.section_id, l.title, l.content_type, l.duration_minutes, l.order_index, l.created_at,
        s.title as section_title, s.order_index as section_order_index,
        c.id as course_id, c.title as course_title, c.code as course_code, c.instructor_id, c.is_published
      FROM lessons l
      JOIN sections s ON l.section_id = s.id
      JOIN courses c ON s.course_id = c.id
      WHERE l.id = $1
    `;
    const lesson = await this.db.queryOne(lessonSql, [id]);

    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID: ${id}`);
    }

    // Access check for unpublished courses
    const isAdmin = currentUser?.role === Role.ADMIN;
    const isOwner = currentUser?.userId === lesson.instructor_id;
    if (!lesson.is_published && !isAdmin && !isOwner) {
      throw new ForbiddenException('Khóa học này chưa được xuất bản');
    }

    // 2. Fetch materials for this lesson
    const materialsSql = `
      SELECT id, type, file_url, transcript, duration_seconds, created_at
      FROM materials
      WHERE lesson_id = $1
      ORDER BY created_at ASC
    `;
    const materials = await this.db.query(materialsSql, [id]);

    // 3. Fetch quiz if this lesson contains one
    const quizSql = `
      SELECT id, title, pass_score, time_limit_minutes, created_at
      FROM quizzes
      WHERE lesson_id = $1
      LIMIT 1
    `;
    const quiz = await this.db.queryOne(quizSql, [id]);

    return {
      success: true,
      data: {
        id: lesson.id,
        title: lesson.title,
        contentType: lesson.content_type,
        durationMinutes: lesson.duration_minutes,
        orderIndex: lesson.order_index,
        createdAt: lesson.created_at,
        section: {
          id: lesson.section_id,
          title: lesson.section_title,
          orderIndex: lesson.section_order_index,
        },
        course: {
          id: lesson.course_id,
          title: lesson.course_title,
          code: lesson.course_code,
        },
        materials: materials.map((m) => ({
          id: m.id,
          type: m.type,
          fileUrl: m.file_url,
          hasTranscript: !!m.transcript,
          durationSeconds: m.duration_seconds,
        })),
        quiz: quiz
          ? {
              id: quiz.id,
              title: quiz.title,
              passScore: Number(quiz.pass_score),
              timeLimitMinutes: quiz.time_limit_minutes,
            }
          : null,
      },
    };
  }

  async update(id: string, dto: UpdateLessonDto, currentUser: CurrentUserPayload) {
    const lesson = await this.db.queryOne('SELECT id, section_id FROM lessons WHERE id = $1', [id]);
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID: ${id}`);
    }

    await this.verifySectionOwnership(lesson.section_id, currentUser);

    const updated = await this.db.queryOne(
      `UPDATE lessons
       SET 
         title = COALESCE($1, title),
         content_type = COALESCE($2, content_type),
         duration_minutes = COALESCE($3, duration_minutes),
         order_index = COALESCE($4, order_index)
       WHERE id = $5
       RETURNING *`,
      [
        dto.title?.trim() || null,
        dto.contentType || null,
        dto.durationMinutes !== undefined ? dto.durationMinutes : null,
        dto.orderIndex !== undefined ? dto.orderIndex : null,
        id,
      ],
    );

    return {
      success: true,
      message: 'Cập nhật bài học thành công',
      data: updated,
    };
  }

  async delete(id: string, currentUser: CurrentUserPayload) {
    const lesson = await this.db.queryOne('SELECT id, section_id FROM lessons WHERE id = $1', [id]);
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID: ${id}`);
    }

    await this.verifySectionOwnership(lesson.section_id, currentUser);

    await this.db.query('DELETE FROM lessons WHERE id = $1', [id]);

    return {
      success: true,
      message: 'Đã xóa bài học thành công',
    };
  }
}
