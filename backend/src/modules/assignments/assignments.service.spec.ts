import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { DatabaseService } from '../../database/database.service';
import { Role } from '../../common/constants/roles.enum';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
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

  const mockAssignmentId = 'assignment-uuid-0001';
  const mockLessonId = 'lesson-uuid-0001';
  const mockCourseId = 'course-uuid-0001';
  const mockRubricId1 = 'rubric-uuid-0001';
  const mockRubricId2 = 'rubric-uuid-0002';

  beforeEach(async () => {
    mockDb = {
      query: jest.fn(),
      queryOne: jest.fn(),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAssignment', () => {
    it('should throw NotFoundException if lesson not found', async () => {
      mockDb.queryOne.mockResolvedValueOnce(null);

      await expect(
        service.createAssignment(
          mockLessonId,
          { title: 'Assignment 1', description: 'Desc' },
          instructorUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject non-owner instructor', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        lesson_id: mockLessonId,
        course_id: mockCourseId,
        instructor_id: 'other-instructor',
      });

      await expect(
        service.createAssignment(
          mockLessonId,
          { title: 'Assignment 1', description: 'Desc' },
          instructorUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject if lesson already has an assignment', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce({
          lesson_id: mockLessonId,
          course_id: mockCourseId,
          instructor_id: instructorUser.userId,
        })
        .mockResolvedValueOnce({ id: 'existing-asg-id' });

      await expect(
        service.createAssignment(
          mockLessonId,
          { title: 'Assignment 1', description: 'Desc' },
          instructorUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create assignment with rubrics in transaction', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce({
          lesson_id: mockLessonId,
          course_id: mockCourseId,
          instructor_id: instructorUser.userId,
        })
        .mockResolvedValueOnce(null);

      mockDb.transaction.mockImplementation(async (callback) => {
        const client = {
          query: jest
            .fn()
            .mockResolvedValueOnce({
              rows: [
                {
                  id: mockAssignmentId,
                  lesson_id: mockLessonId,
                  title: 'Assignment 1',
                  description: 'Desc',
                  allowed_file_types: ['zip', 'pdf'],
                  total_points: 100,
                  pass_score: 60,
                },
              ],
            })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({
              rows: [
                {
                  id: mockRubricId1,
                  assignment_id: mockAssignmentId,
                  criterion_name: 'Rubric 1',
                  max_points: 50,
                },
              ],
            }),
        };
        return callback(client as any);
      });

      const res = await service.createAssignment(
        mockLessonId,
        {
          title: 'Assignment 1',
          description: 'Desc',
          allowedFileTypes: ['zip', 'pdf'],
          totalPoints: 100,
          passScore: 60,
          rubrics: [
            {
              criterionName: 'Rubric 1',
              maxPoints: 50,
            },
          ],
        },
        instructorUser,
      );

      expect(res.success).toBe(true);
      expect(res.data.id).toBe(mockAssignmentId);
      expect(res.data.rubrics).toHaveLength(1);
    });
  });

  describe('submitAssignment (Student file submission)', () => {
    const mockAssignmentContext = {
      assignment_id: mockAssignmentId,
      title: 'Monorepo Assignment',
      description: 'Setup monorepo',
      allowed_file_types: ['zip', 'pdf', 'tar.gz'],
      max_file_size_mb: 25,
      due_date: new Date(Date.now() + 86400000), // Due tomorrow
      total_points: 100,
      pass_score: 50,
      lesson_id: mockLessonId,
      lesson_title: 'Lesson 1',
      section_id: 'sec-1',
      course_id: mockCourseId,
      course_title: 'Course 1',
      instructor_id: instructorUser.userId,
    };

    it('should reject if student is not enrolled', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(mockAssignmentContext)
        .mockResolvedValueOnce(null);

      await expect(
        service.submitAssignment(
          mockAssignmentId,
          undefined,
          { fileUrl: 'https://example.com/file.zip' },
          studentUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject disallowed file extensions', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(mockAssignmentContext)
        .mockResolvedValueOnce({ id: 'enr-1', status: 'active' });

      const fakeFile: any = {
        originalname: 'malicious.exe',
        size: 1024,
        mimetype: 'application/x-msdownload',
      };

      await expect(
        service.submitAssignment(mockAssignmentId, fakeFile, {}, studentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should submit successfully with valid file', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(mockAssignmentContext)
        .mockResolvedValueOnce({ id: 'enr-1', status: 'active' })
        .mockResolvedValueOnce(null) // No existing submission
        .mockResolvedValueOnce({
          id: 'sub-asg-1',
          assignment_id: mockAssignmentId,
          student_id: studentUser.userId,
          file_url: '/uploads/assignments/my-submission.zip',
          original_filename: 'my-submission.zip',
          file_size_bytes: 2048,
          status: 'submitted',
          is_late: false,
          submitted_at: new Date(),
        });

      const fakeFile: any = {
        filename: 'my-submission-123.zip',
        originalname: 'my-submission.zip',
        size: 2048,
        mimetype: 'application/zip',
      };

      const res = await service.submitAssignment(
        mockAssignmentId,
        fakeFile,
        { notes: 'Here is my assignment' },
        studentUser,
      );

      expect(res.success).toBe(true);
      expect(res.data.isLate).toBe(false);
      expect(res.data.originalFilename).toBe('my-submission.zip');
    });

    it('should detect late submission when past due date', async () => {
      const pastDueDateContext = {
        ...mockAssignmentContext,
        due_date: new Date(Date.now() - 86400000), // Due yesterday
      };

      mockDb.queryOne
        .mockResolvedValueOnce(pastDueDateContext)
        .mockResolvedValueOnce({ id: 'enr-1', status: 'active' })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'sub-asg-1',
          status: 'submitted',
          is_late: true,
          submitted_at: new Date(),
        });

      const fakeFile: any = {
        filename: 'my-submission-late.zip',
        originalname: 'my-submission.zip',
        size: 2048,
        mimetype: 'application/zip',
      };

      const res = await service.submitAssignment(
        mockAssignmentId,
        fakeFile,
        {},
        studentUser,
      );

      expect(res.success).toBe(true);
      expect(res.message).toContain('CẢNH BÁO');
      expect(res.data.isLate).toBe(true);
    });
  });

  describe('gradeSubmission (Instructor grading via Rubric)', () => {
    const mockSubmissionContext = {
      submission_id: 'sub-asg-1',
      assignment_id: mockAssignmentId,
      student_id: studentUser.userId,
      lesson_id: mockLessonId,
      course_id: mockCourseId,
      instructor_id: instructorUser.userId,
      pass_score: 60,
      total_points: 100,
    };

    it('should reject if instructor does not own the course', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        ...mockSubmissionContext,
        instructor_id: 'different-instructor',
      });

      await expect(
        service.gradeSubmission('sub-asg-1', { evaluations: [] }, instructorUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject if pointsAwarded exceeds rubric maxPoints', async () => {
      mockDb.queryOne.mockResolvedValueOnce(mockSubmissionContext);

      mockDb.query.mockResolvedValueOnce([
        { id: mockRubricId1, criterion_name: 'Rubric 1', max_points: 30 },
      ]);

      await expect(
        service.gradeSubmission(
          'sub-asg-1',
          {
            evaluations: [
              { rubricId: mockRubricId1, pointsAwarded: 35 }, // Exceeds 30
            ],
          },
          instructorUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save rubric scores, compute totalScore, and mark lesson complete if passed', async () => {
      mockDb.queryOne.mockResolvedValueOnce(mockSubmissionContext);

      mockDb.query.mockResolvedValueOnce([
        { id: mockRubricId1, criterion_name: 'Rubric 1', max_points: 40 },
        { id: mockRubricId2, criterion_name: 'Rubric 2', max_points: 60 },
      ]);

      mockDb.transaction.mockImplementation(async (callback) => {
        const client = {
          query: jest
            .fn()
            .mockResolvedValueOnce({ rows: [] }) // DELETE old evaluations
            .mockResolvedValueOnce({ rows: [{ id: 'eval-1' }] }) // INSERT eval 1
            .mockResolvedValueOnce({ rows: [{ id: 'eval-2' }] }) // INSERT eval 2
            .mockResolvedValueOnce({
              rows: [{ id: 'sub-asg-1', graded_at: new Date() }],
            }) // UPDATE submission
            .mockResolvedValueOnce({ rows: [] }), // UPDATE progress_records
        };
        return callback(client as any);
      });

      const res = await service.gradeSubmission(
        'sub-asg-1',
        {
          evaluations: [
            { rubricId: mockRubricId1, pointsAwarded: 35, feedback: 'Great job' },
            { rubricId: mockRubricId2, pointsAwarded: 50, feedback: 'Well done' },
          ],
          generalFeedback: 'Overall excellent project',
        },
        instructorUser,
      );

      expect(res.success).toBe(true);
      expect(res.data.totalScore).toBe(85);
      expect(res.data.isPassed).toBe(true);
      expect(res.data.evaluations).toHaveLength(2);
    });
  });
});
