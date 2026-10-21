import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles.enum';

@Injectable()
export class SectionsService {
  constructor(private db: DatabaseService) {}

  private async verifyCourseOwnership(courseId: string, currentUser: CurrentUserPayload) {
    const course = await this.db.queryOne('SELECT id, instructor_id FROM courses WHERE id = $1', [
      courseId,
    ]);
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID: ${courseId}`);
    }
    const isAdmin = currentUser.role === Role.ADMIN;
    const isOwner = currentUser.userId === course.instructor_id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa khóa học này');
    }
    return course;
  }

  async create(courseId: string, dto: CreateSectionDto, currentUser: CurrentUserPayload) {
    await this.verifyCourseOwnership(courseId, currentUser);

    let orderIndex = dto.orderIndex;
    if (orderIndex === undefined || orderIndex === null) {
      const maxOrder = await this.db.queryOne<{ max_order: number | null }>(
        'SELECT MAX(order_index) as max_order FROM sections WHERE course_id = $1',
        [courseId],
      );
      orderIndex = (maxOrder?.max_order ?? 0) + 1;
    }

    const newSection = await this.db.queryOne(
      `INSERT INTO sections (course_id, title, order_index)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [courseId, dto.title.trim(), orderIndex],
    );

    if (!newSection) {
      throw new InternalServerErrorException('Không thể tạo chương mục');
    }

    return {
      success: true,
      message: 'Tạo chương mục thành công',
      data: newSection,
    };
  }

  async update(sectionId: string, dto: UpdateSectionDto, currentUser: CurrentUserPayload) {
    const section = await this.db.queryOne(
      'SELECT id, course_id, title, order_index FROM sections WHERE id = $1',
      [sectionId],
    );
    if (!section) {
      throw new NotFoundException(`Không tìm thấy chương mục với ID: ${sectionId}`);
    }

    await this.verifyCourseOwnership(section.course_id, currentUser);

    const updated = await this.db.queryOne(
      `UPDATE sections
       SET 
         title = COALESCE($1, title),
         order_index = COALESCE($2, order_index)
       WHERE id = $3
       RETURNING *`,
      [
        dto.title?.trim() || null,
        dto.orderIndex !== undefined ? dto.orderIndex : null,
        sectionId,
      ],
    );

    return {
      success: true,
      message: 'Cập nhật chương mục thành công',
      data: updated,
    };
  }

  async delete(sectionId: string, currentUser: CurrentUserPayload) {
    const section = await this.db.queryOne(
      'SELECT id, course_id FROM sections WHERE id = $1',
      [sectionId],
    );
    if (!section) {
      throw new NotFoundException(`Không tìm thấy chương mục với ID: ${sectionId}`);
    }

    await this.verifyCourseOwnership(section.course_id, currentUser);

    await this.db.query('DELETE FROM sections WHERE id = $1', [sectionId]);

    return {
      success: true,
      message: 'Đã xóa chương mục thành công',
    };
  }

  async reorder(
    courseId: string,
    dto: ReorderSectionsDto,
    currentUser: CurrentUserPayload,
  ) {
    await this.verifyCourseOwnership(courseId, currentUser);

    await this.db.transaction(async (client) => {
      // 1. Temporarily negate order_index to avoid unique constraint collisions
      for (let i = 0; i < dto.sections.length; i++) {
        const item = dto.sections[i];
        await client.query(
          'UPDATE sections SET order_index = $1 WHERE id = $2 AND course_id = $3',
          [-(i + 1), item.id, courseId],
        );
      }

      // 2. Set actual new order_index
      for (const item of dto.sections) {
        await client.query(
          'UPDATE sections SET order_index = $1 WHERE id = $2 AND course_id = $3',
          [item.orderIndex, item.id, courseId],
        );
      }
    });

    const updatedSections = await this.db.query(
      'SELECT id, course_id, title, order_index FROM sections WHERE course_id = $1 ORDER BY order_index ASC',
      [courseId],
    );

    return {
      success: true,
      message: 'Sắp xếp lại thứ tự chương mục thành công',
      data: updatedSections,
    };
  }
}
