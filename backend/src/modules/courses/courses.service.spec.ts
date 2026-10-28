import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { DatabaseService } from '../../database/database.service';
import { Role } from '../../common/constants/roles.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;
  let mockDb: {
    query: jest.Mock;
    queryOne: jest.Mock;
  };

  beforeEach(async () => {
    mockDb = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated courses for unauthenticated student filtering published only', async () => {
      mockDb.queryOne.mockResolvedValueOnce({ total: '1' });
      mockDb.query.mockResolvedValueOnce([
        {
          id: 'c0310300-0000-0000-0000-000000000001',
          code: 'CO3103',
          title: 'Integrated Software Engineering',
          description: 'Capstone project',
          thumbnail_url: 'https://example.com/thumb.jpg',
          category: 'Software Engineering',
          level: 'Advanced',
          is_published: true,
          created_at: new Date(),
          updated_at: new Date(),
          instructor_id: 'user-001',
          instructor_name: 'Dr. Nguyen',
          instructor_email: 'instructor@hcmut.edu.vn',
          instructor_avatar: null,
          sections_count: '2',
          lessons_count: '4',
          enrollment_count: '15',
        },
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0].code).toBe('CO3103');
      expect(result.data[0].sectionsCount).toBe(2);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);

      // Verify published filter was enforced
      const countCallSql = mockDb.queryOne.mock.calls[0][0];
      expect(countCallSql).toContain('c.is_published = TRUE');
    });

    it('should allow Admin to see unpublished courses', async () => {
      mockDb.queryOne.mockResolvedValueOnce({ total: '0' });
      mockDb.query.mockResolvedValueOnce([]);

      const adminUser = {
        userId: 'admin-id',
        email: 'admin@hcmut.edu.vn',
        role: Role.ADMIN,
        fullName: 'Admin',
      };

      await service.findAll({ isPublished: false }, adminUser);

      const countCallSql = mockDb.queryOne.mock.calls[0][0];
      expect(countCallSql).toContain('c.is_published = $1');
      expect(mockDb.queryOne.mock.calls[0][1]).toContain(false);
    });
  });

  describe('findById', () => {
    it('should return hierarchical course syllabus', async () => {
      const courseId = 'course-123';
      mockDb.queryOne.mockResolvedValueOnce({
        id: courseId,
        code: 'CO3103',
        title: 'Capstone',
        is_published: true,
        instructor_id: 'inst-1',
        instructor_name: 'Dr. Test',
      });

      // sections
      mockDb.query.mockResolvedValueOnce([
        { id: 'sec-1', course_id: courseId, title: 'Chapter 1', order_index: 1 },
      ]);

      // lessons
      mockDb.query.mockResolvedValueOnce([
        {
          id: 'les-1',
          section_id: 'sec-1',
          title: 'Lesson 1',
          content_type: 'video',
          duration_minutes: 30,
          order_index: 1,
          quiz_id: null,
        },
      ]);

      const result = await service.findById(courseId);
      expect(result.success).toBe(true);
      expect(result.data.sections.length).toBe(1);
      expect(result.data.sections[0].lessons.length).toBe(1);
      expect(result.data.sections[0].lessons[0].title).toBe('Lesson 1');
      expect(result.data.chapters).toBeDefined(); // Frontend alias
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockDb.queryOne.mockResolvedValueOnce(null);
      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if course is unpublished and user is student', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: 'course-1',
        is_published: false,
        instructor_id: 'inst-1',
      });

      const studentUser = {
        userId: 'student-1',
        email: 's@test.com',
        role: Role.STUDENT,
        fullName: 'Student',
      };

      await expect(service.findById('course-1', studentUser)).rejects.toThrow(ForbiddenException);
    });
  });
});
