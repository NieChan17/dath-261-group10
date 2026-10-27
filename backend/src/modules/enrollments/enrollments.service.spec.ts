import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { DatabaseService } from '../../database/database.service';
import { Role } from '../../common/constants/roles.enum';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let mockDb: {
    query: jest.Mock;
    queryOne: jest.Mock;
    transaction: jest.Mock;
  };

  const studentUser = {
    userId: 'student-uuid-0001',
    email: 'student@edupulse.hcmut.edu.vn',
    role: Role.STUDENT,
    fullName: 'Tran Van Hoc Vien',
  };

  const instructorUser = {
    userId: 'instructor-uuid-0001',
    email: 'instructor@edupulse.hcmut.edu.vn',
    role: Role.INSTRUCTOR,
    fullName: 'Dr. Nguyen Van A',
  };

  const adminUser = {
    userId: 'admin-uuid-0001',
    email: 'admin@edupulse.hcmut.edu.vn',
    role: Role.ADMIN,
    fullName: 'System Administrator',
  };

  const mockCourseId = 'course-uuid-0001';
  const mockEnrollmentId = 'enrollment-uuid-0001';
  const mockLessonId = 'lesson-uuid-0001';

  beforeEach(async () => {
    mockDb = {
      query: jest.fn(),
      queryOne: jest.fn(),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enroll', () => {
    it('should reject non-student users', async () => {
      await expect(service.enroll(mockCourseId, instructorUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockDb.queryOne.mockResolvedValueOnce(null);

      await expect(service.enroll(mockCourseId, studentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if course is not published', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: mockCourseId,
        title: 'Draft Course',
        is_published: false,
      });

      await expect(service.enroll(mockCourseId, studentUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should successfully enroll a new student in a published course', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce({
          id: mockCourseId,
          title: 'CO3103 Capstone',
          is_published: true,
        })
        .mockResolvedValueOnce(null) // no existing enrollment
        .mockResolvedValueOnce({
          id: mockEnrollmentId,
          student_id: studentUser.userId,
          course_id: mockCourseId,
          status: 'active',
          enrolled_at: new Date(),
        });

      const result = await service.enroll(mockCourseId, studentUser);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Đăng ký khóa học thành công');
      expect(result.data.id).toBe(mockEnrollmentId);
      expect(result.data.course.title).toBe('CO3103 Capstone');
    });

    it('should return existing active enrollment message if already enrolled', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce({
          id: mockCourseId,
          title: 'CO3103 Capstone',
          is_published: true,
        })
        .mockResolvedValueOnce({
          id: mockEnrollmentId,
          student_id: studentUser.userId,
          course_id: mockCourseId,
          status: 'active',
          enrolled_at: new Date(),
        });

      const result = await service.enroll(mockCourseId, studentUser);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Bạn đã đăng ký khóa học này');
    });

    it('should throw ForbiddenException if existing enrollment is suspended', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce({
          id: mockCourseId,
          title: 'CO3103 Capstone',
          is_published: true,
        })
        .mockResolvedValueOnce({
          id: mockEnrollmentId,
          student_id: studentUser.userId,
          course_id: mockCourseId,
          status: 'suspended',
          enrolled_at: new Date(),
        });

      await expect(service.enroll(mockCourseId, studentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should reactivate enrollment if previously cancelled', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce({
          id: mockCourseId,
          title: 'CO3103 Capstone',
          is_published: true,
        })
        .mockResolvedValueOnce({
          id: mockEnrollmentId,
          student_id: studentUser.userId,
          course_id: mockCourseId,
          status: 'cancelled',
          enrolled_at: new Date(),
        })
        .mockResolvedValueOnce({
          id: mockEnrollmentId,
          student_id: studentUser.userId,
          course_id: mockCourseId,
          status: 'active',
          enrolled_at: new Date(),
        });

      const result = await service.enroll(mockCourseId, studentUser);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Đăng ký lại khóa học thành công');
      expect(result.data.status).toBe('active');
    });
  });

  describe('findMine', () => {
    it('should return enrolled courses with progress summary', async () => {
      mockDb.query.mockResolvedValueOnce([
        {
          id: mockEnrollmentId,
          status: 'active',
          enrolled_at: new Date(),
          course_id: mockCourseId,
          course_code: 'CO3103',
          course_title: 'Software Engineering',
          course_description: 'Capstone project',
          thumbnail_url: 'https://example.com/thumb.jpg',
          category: 'Software Engineering',
          level: 'Advanced',
          instructor_id: 'inst-1',
          instructor_name: 'Dr. Nguyen',
          total_lessons: '4',
          completed_lessons: '2',
          last_activity_at: new Date(),
        },
      ]);

      const result = await service.findMine(studentUser);

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0].progress.percentage).toBe(50);
      expect(result.data[0].progress.totalLessons).toBe(4);
      expect(result.data[0].progress.completedLessons).toBe(2);
      expect(result.data[0].course.code).toBe('CO3103');
    });
  });

  describe('getEnrollmentByCourse', () => {
    it('should return isEnrolled: false when not enrolled', async () => {
      mockDb.queryOne.mockResolvedValueOnce(null);

      const result = await service.getEnrollmentByCourse(mockCourseId, studentUser);

      expect(result.success).toBe(true);
      expect(result.isEnrolled).toBe(false);
      expect(result.data).toBeNull();
    });

    it('should return isEnrolled: true when enrolled', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: mockEnrollmentId,
        student_id: studentUser.userId,
        course_id: mockCourseId,
        status: 'active',
        enrolled_at: new Date(),
      });

      const result = await service.getEnrollmentByCourse(mockCourseId, studentUser);

      expect(result.success).toBe(true);
      expect(result.isEnrolled).toBe(true);
      expect(result.data?.id).toBe(mockEnrollmentId);
    });
  });

  describe('getProgress', () => {
    it('should compute summary and resumeLesson accurately', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: mockEnrollmentId,
        student_id: studentUser.userId,
        course_id: mockCourseId,
        status: 'active',
        enrolled_at: new Date(),
      });

      mockDb.query.mockResolvedValueOnce([
        {
          lesson_id: 'lesson-1',
          lesson_title: 'Lesson 1',
          content_type: 'video',
          duration_minutes: 20,
          lesson_order: 1,
          section_id: 'sec-1',
          section_title: 'Section 1',
          section_order: 1,
          is_completed: true,
          last_position_seconds: 1200,
          progress_updated_at: new Date(),
        },
        {
          lesson_id: 'lesson-2',
          lesson_title: 'Lesson 2',
          content_type: 'video',
          duration_minutes: 25,
          lesson_order: 2,
          section_id: 'sec-1',
          section_title: 'Section 1',
          section_order: 1,
          is_completed: false,
          last_position_seconds: 350,
          progress_updated_at: new Date(),
        },
      ]);

      const result = await service.getProgress(mockEnrollmentId, studentUser);

      expect(result.success).toBe(true);
      expect(result.data.summary.totalLessons).toBe(2);
      expect(result.data.summary.completedLessons).toBe(1);
      expect(result.data.summary.percentage).toBe(50);
      expect(result.data.resumeLesson?.lessonId).toBe('lesson-2');
      expect(result.data.resumeLesson?.lastPositionSeconds).toBe(350);
    });

    it('should throw ForbiddenException if enrollment belongs to someone else', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(null) // not owned
        .mockResolvedValueOnce({ id: mockEnrollmentId }); // exists in db

      await expect(service.getProgress(mockEnrollmentId, studentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getProgressByCourse', () => {
    it('should throw NotFoundException if student not enrolled in the course', async () => {
      mockDb.queryOne.mockResolvedValueOnce(null);

      await expect(service.getProgressByCourse(mockCourseId, studentUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProgress', () => {
    it('should throw BadRequestException if neither isCompleted nor lastPositionSeconds provided', async () => {
      await expect(
        service.updateProgress(mockEnrollmentId, mockLessonId, {}, studentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update progress and mark enrollment completed when all lessons are finished', async () => {
      mockDb.transaction.mockImplementation(async (cb) => {
        const client = {
          query: jest.fn(),
        };

        client.query
          .mockResolvedValueOnce({
            rows: [{ id: mockEnrollmentId, course_id: mockCourseId, status: 'active' }],
          }) // select enrollment
          .mockResolvedValueOnce({ rows: [{ id: mockLessonId }] }) // select lesson
          .mockResolvedValueOnce({
            rows: [
              {
                id: 'progress-uuid-1',
                enrollment_id: mockEnrollmentId,
                lesson_id: mockLessonId,
                is_completed: true,
                last_position_seconds: 600,
                updated_at: new Date(),
              },
            ],
          }) // upsert progress_records
          .mockResolvedValueOnce({ rows: [{ total: 2, completed: 2 }] }) // count totals
          .mockResolvedValueOnce({ rows: [] }); // update enrollment status to completed

        return cb(client);
      });

      const result = await service.updateProgress(
        mockEnrollmentId,
        mockLessonId,
        { isCompleted: true, lastPositionSeconds: 600 },
        studentUser,
      );

      expect(result.success).toBe(true);
      expect(result.data.isCompleted).toBe(true);
      expect(result.data.summary.percentage).toBe(100);
    });
  });

  describe('cancel', () => {
    it('should throw ConflictException if enrollment is already completed', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: mockEnrollmentId,
        student_id: studentUser.userId,
        course_id: mockCourseId,
        status: 'completed',
        enrolled_at: new Date(),
      });

      await expect(service.cancel(mockEnrollmentId, studentUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should successfully cancel active enrollment', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce({
          id: mockEnrollmentId,
          student_id: studentUser.userId,
          course_id: mockCourseId,
          status: 'active',
          enrolled_at: new Date(),
        })
        .mockResolvedValueOnce({
          id: mockEnrollmentId,
          student_id: studentUser.userId,
          course_id: mockCourseId,
          status: 'cancelled',
          enrolled_at: new Date(),
        });

      const result = await service.cancel(mockEnrollmentId, studentUser);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Đã hủy đăng ký khóa học');
      expect(result.data?.status).toBe('cancelled');
    });
  });

  describe('getCourseEnrollments', () => {
    it('should reject instructor who does not own the course', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: mockCourseId,
        instructor_id: 'other-instructor-id',
      });

      await expect(
        service.getCourseEnrollments(mockCourseId, instructorUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow course owner instructor to view students', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: mockCourseId,
        instructor_id: instructorUser.userId,
      });

      mockDb.query.mockResolvedValueOnce([
        {
          id: mockEnrollmentId,
          status: 'active',
          enrolled_at: new Date(),
          student_id: studentUser.userId,
          student_name: 'Tran Van Hoc Vien',
          student_email: 'student@edupulse.hcmut.edu.vn',
          student_avatar: null,
          total_lessons: '4',
          completed_lessons: '1',
          last_activity_at: new Date(),
        },
      ]);

      const result = await service.getCourseEnrollments(mockCourseId, instructorUser);

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0].student.fullName).toBe('Tran Van Hoc Vien');
      expect(result.data[0].progress.percentage).toBe(25);
    });

    it('should allow admin to view any course enrollments', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: mockCourseId,
        instructor_id: 'any-instructor',
      });

      mockDb.query.mockResolvedValueOnce([]);

      const result = await service.getCourseEnrollments(mockCourseId, adminUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});
