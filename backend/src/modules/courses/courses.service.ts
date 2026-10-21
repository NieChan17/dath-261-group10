import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CourseQueryDto } from './dto/course-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles.enum';

@Injectable()
export class CoursesService {
  constructor(private db: DatabaseService) {}

  async findAll(
    query: CourseQueryDto,
    currentUser?: CurrentUserPayload,
  ): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // 1. Publish visibility rule:
    // If not admin and not instructor, only published courses are visible.
    const isAdmin = currentUser?.role === Role.ADMIN;
    const isInstructor = currentUser?.role === Role.INSTRUCTOR;

    if (!isAdmin && !isInstructor) {
      whereClauses.push('c.is_published = TRUE');
    } else if (query.isPublished !== undefined) {
      whereClauses.push(`c.is_published = $${paramIndex}`);
      params.push(query.isPublished);
      paramIndex++;
    } else if (isInstructor && !isAdmin) {
      // Instructor sees published courses OR their own unpublished courses
      whereClauses.push(`(c.is_published = TRUE OR c.instructor_id = $${paramIndex})`);
      params.push(currentUser.userId);
      paramIndex++;
    }

    // 2. Search keyword filter
    if (query.search && query.search.trim()) {
      const searchPattern = `%${query.search.trim()}%`;
      whereClauses.push(
        `(c.title ILIKE $${paramIndex} OR c.code ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`,
      );
      params.push(searchPattern);
      paramIndex++;
    }

    // 3. Category filter
    if (query.category && query.category.trim()) {
      whereClauses.push(`c.category ILIKE $${paramIndex}`);
      params.push(`%${query.category.trim()}%`);
      paramIndex++;
    }

    // 4. Level filter
    if (query.level) {
      whereClauses.push(`c.level = $${paramIndex}`);
      params.push(query.level);
      paramIndex++;
    }

    // 5. Instructor filter
    if (query.instructorId) {
      whereClauses.push(`c.instructor_id = $${paramIndex}`);
      params.push(query.instructorId);
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Allowed sort columns
    const allowedSortColumns: Record<string, string> = {
      created_at: 'c.created_at',
      createdAt: 'c.created_at',
      title: 'c.title',
      code: 'c.code',
      level: 'c.level',
    };
    const sortCol = allowedSortColumns[query.sortBy || ''] || 'c.created_at';
    const sortDir = query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total query
    const countSql = `
      SELECT COUNT(*) as total 
      FROM courses c
      ${whereSql}
    `;
    const countResult = await this.db.queryOne<{ total: string }>(countSql, params);
    const total = parseInt(countResult?.total || '0', 10);

    // Data query with joins for instructor, section count, lesson count, enrollment count
    const dataSql = `
      SELECT 
        c.id,
        c.code,
        c.title,
        c.description,
        c.thumbnail_url,
        c.category,
        c.level,
        c.is_published,
        c.created_at,
        c.updated_at,
        u.id as instructor_id,
        u.full_name as instructor_name,
        u.email as instructor_email,
        u.avatar_url as instructor_avatar,
        COALESCE(sec.sections_count, 0) as sections_count,
        COALESCE(les.lessons_count, 0) as lessons_count,
        COALESCE(enr.enrollment_count, 0) as enrollment_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN (
        SELECT course_id, COUNT(*) as sections_count
        FROM sections
        GROUP BY course_id
      ) sec ON sec.course_id = c.id
      LEFT JOIN (
        SELECT s.course_id, COUNT(l.id) as lessons_count
        FROM sections s
        JOIN lessons l ON l.section_id = s.id
        GROUP BY s.course_id
      ) les ON les.course_id = c.id
      LEFT JOIN (
        SELECT course_id, COUNT(*) as enrollment_count
        FROM enrollments
        WHERE status = 'active'
        GROUP BY course_id
      ) enr ON enr.course_id = c.id
      ${whereSql}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const rows = await this.db.query(dataSql, params);
    const totalPages = Math.ceil(total / limit) || 1;

    const formattedData = rows.map((r) => ({
      id: r.id,
      code: r.code,
      title: r.title,
      description: r.description,
      thumbnailUrl: r.thumbnail_url,
      category: r.category,
      level: r.level,
      isPublished: r.is_published,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      instructor: {
        id: r.instructor_id,
        fullName: r.instructor_name,
        email: r.instructor_email,
        avatarUrl: r.instructor_avatar,
      },
      sectionsCount: parseInt(r.sections_count, 10),
      lessonsCount: parseInt(r.lessons_count, 10),
      enrollmentCount: parseInt(r.enrollment_count, 10),
    }));

    return {
      success: true,
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string, currentUser?: CurrentUserPayload) {
    // 1. Fetch course info
    const courseSql = `
      SELECT 
        c.id, c.code, c.title, c.description, c.thumbnail_url,
        c.category, c.level, c.is_published, c.created_at, c.updated_at,
        u.id as instructor_id, u.full_name as instructor_name,
        u.email as instructor_email, u.avatar_url as instructor_avatar
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1
    `;
    const course = await this.db.queryOne(courseSql, [id]);

    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID: ${id}`);
    }

    // Access check for unpublished courses
    const isAdmin = currentUser?.role === Role.ADMIN;
    const isOwner = currentUser?.userId === course.instructor_id;
    if (!course.is_published && !isAdmin && !isOwner) {
      throw new ForbiddenException('Khóa học này chưa được xuất bản');
    }

    // 2. Fetch sections (ordered by order_index)
    const sectionsSql = `
      SELECT id, course_id, title, order_index, created_at
      FROM sections
      WHERE course_id = $1
      ORDER BY order_index ASC, created_at ASC
    `;
    const sections = await this.db.query(sectionsSql, [id]);

    // 3. Fetch lessons for the course
    const lessonsSql = `
      SELECT 
        l.id, l.section_id, l.title, l.content_type, l.duration_minutes,
        l.order_index, l.created_at,
        q.id as quiz_id, q.title as quiz_title, q.pass_score as quiz_pass_score,
        q.time_limit_minutes as quiz_time_limit
      FROM lessons l
      JOIN sections s ON l.section_id = s.id
      LEFT JOIN quizzes q ON q.lesson_id = l.id
      WHERE s.course_id = $1
      ORDER BY l.order_index ASC, l.created_at ASC
    `;
    const lessons = await this.db.query(lessonsSql, [id]);

    // 4. Assemble hierarchical syllabus
    const assembledSections = sections.map((sec) => {
      const secLessons = lessons
        .filter((les) => les.section_id === sec.id)
        .map((les) => ({
          id: les.id,
          sectionId: les.section_id,
          title: les.title,
          contentType: les.content_type,
          durationMinutes: les.duration_minutes || 0,
          orderIndex: les.order_index,
          createdAt: les.created_at,
          quiz: les.quiz_id
            ? {
                id: les.quiz_id,
                title: les.quiz_title,
                passScore: Number(les.quiz_pass_score),
                timeLimitMinutes: les.quiz_time_limit,
              }
            : null,
        }));

      return {
        id: sec.id,
        courseId: sec.course_id,
        title: sec.title,
        orderIndex: sec.order_index,
        createdAt: sec.created_at,
        lessonsCount: secLessons.length,
        lessons: secLessons,
      };
    });

    return {
      success: true,
      data: {
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnail_url,
        category: course.category,
        level: course.level,
        isPublished: course.is_published,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
        instructor: {
          id: course.instructor_id,
          fullName: course.instructor_name,
          email: course.instructor_email,
          avatarUrl: course.instructor_avatar,
        },
        sectionsCount: assembledSections.length,
        totalLessonsCount: lessons.length,
        sections: assembledSections,
        chapters: assembledSections, // Alias for frontend compatibility
      },
    };
  }

  async create(dto: CreateCourseDto, instructorId: string) {
    // 1. Check if code already exists
    const existing = await this.db.queryOne(
      'SELECT id FROM courses WHERE code = $1',
      [dto.code.trim().toUpperCase()],
    );
    if (existing) {
      throw new ConflictException(`Mã khóa học '${dto.code}' đã tồn tại`);
    }

    // 2. Insert course
    const newCourse = await this.db.queryOne(
      `INSERT INTO courses (instructor_id, code, title, description, thumbnail_url, category, level, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        instructorId,
        dto.code.trim().toUpperCase(),
        dto.title.trim(),
        dto.description || null,
        dto.thumbnailUrl || null,
        dto.category || 'General',
        dto.level || 'Beginner',
        dto.isPublished || false,
      ],
    );

    if (!newCourse) {
      throw new InternalServerErrorException('Không thể tạo khóa học');
    }

    return {
      success: true,
      message: 'Tạo khóa học thành công',
      data: newCourse,
    };
  }

  async update(id: string, dto: UpdateCourseDto, currentUser: CurrentUserPayload) {
    const course = await this.db.queryOne('SELECT * FROM courses WHERE id = $1', [id]);
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID: ${id}`);
    }

    // Permission check
    const isAdmin = currentUser.role === Role.ADMIN;
    const isOwner = currentUser.userId === course.instructor_id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa khóa học này');
    }

    // Check code conflict if updating code
    if (dto.code && dto.code.trim().toUpperCase() !== course.code) {
      const codeExists = await this.db.queryOne(
        'SELECT id FROM courses WHERE code = $1 AND id != $2',
        [dto.code.trim().toUpperCase(), id],
      );
      if (codeExists) {
        throw new ConflictException(`Mã khóa học '${dto.code}' đã tồn tại`);
      }
    }

    const updated = await this.db.queryOne(
      `UPDATE courses
       SET 
         title = COALESCE($1, title),
         code = COALESCE($2, code),
         description = COALESCE($3, description),
         thumbnail_url = COALESCE($4, thumbnail_url),
         category = COALESCE($5, category),
         level = COALESCE($6, level),
         is_published = COALESCE($7, is_published),
         updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        dto.title?.trim() || null,
        dto.code?.trim().toUpperCase() || null,
        dto.description || null,
        dto.thumbnailUrl || null,
        dto.category || null,
        dto.level || null,
        dto.isPublished !== undefined ? dto.isPublished : null,
        id,
      ],
    );

    return {
      success: true,
      message: 'Cập nhật khóa học thành công',
      data: updated,
    };
  }

  async delete(id: string, currentUser: CurrentUserPayload) {
    const course = await this.db.queryOne('SELECT * FROM courses WHERE id = $1', [id]);
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID: ${id}`);
    }

    const isAdmin = currentUser.role === Role.ADMIN;
    const isOwner = currentUser.userId === course.instructor_id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền xóa khóa học này');
    }

    await this.db.query('DELETE FROM courses WHERE id = $1', [id]);

    return {
      success: true,
      message: 'Đã xóa khóa học thành công',
    };
  }

  async togglePublish(id: string, currentUser: CurrentUserPayload) {
    const course = await this.db.queryOne('SELECT * FROM courses WHERE id = $1', [id]);
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID: ${id}`);
    }

    const isAdmin = currentUser.role === Role.ADMIN;
    const isOwner = currentUser.userId === course.instructor_id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền thay đổi trạng thái khóa học này');
    }

    const newStatus = !course.is_published;
    const updated = await this.db.queryOne(
      'UPDATE courses SET is_published = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newStatus, id],
    );

    return {
      success: true,
      message: `Khóa học đã được ${newStatus ? 'xuất bản' : 'chuyển sang bản nháp'}`,
      isPublished: newStatus,
      data: updated,
    };
  }
}
