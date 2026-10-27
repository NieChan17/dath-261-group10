import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { DatabaseService } from '../../database/database.service';
import { Role } from '../../common/constants/roles.enum';

describe('QuizzesService', () => {
  let service: QuizzesService;
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

  const mockQuizId = 'quiz-uuid-0001';
  const mockLessonId = 'lesson-uuid-0001';
  const mockCourseId = 'course-uuid-0001';

  beforeEach(async () => {
    mockDb = {
      query: jest.fn(),
      queryOne: jest.fn(),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzesService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<QuizzesService>(QuizzesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createQuiz', () => {
    it('should throw NotFoundException if lesson does not exist', async () => {
      mockDb.queryOne.mockResolvedValueOnce(null);
      await expect(
        service.createQuiz(
          mockLessonId,
          { title: 'Quiz 1' },
          instructorUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject non-owner instructor', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        lesson_id: mockLessonId,
        course_id: mockCourseId,
        instructor_id: 'different-instructor-uuid',
      });

      await expect(
        service.createQuiz(
          mockLessonId,
          { title: 'Quiz 1' },
          instructorUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject if lesson already has a quiz', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce({
          lesson_id: mockLessonId,
          course_id: mockCourseId,
          instructor_id: instructorUser.userId,
        })
        .mockResolvedValueOnce({ id: 'existing-quiz-id' });

      await expect(
        service.createQuiz(
          mockLessonId,
          { title: 'Quiz 1' },
          instructorUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a quiz with questions successfully in transaction', async () => {
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
                  id: mockQuizId,
                  lesson_id: mockLessonId,
                  title: 'Quiz 1',
                  pass_score: 80,
                  time_limit_minutes: 15,
                },
              ],
            })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({
              rows: [
                {
                  id: 'q-1',
                  quiz_id: mockQuizId,
                  prompt: 'What is XSS?',
                  points: 5,
                },
              ],
            }),
        };
        return callback(client as any);
      });

      const res = await service.createQuiz(
        mockLessonId,
        {
          title: 'Quiz 1',
          passScore: 80,
          timeLimitMinutes: 15,
          questions: [
            {
              prompt: 'What is XSS?',
              options: ['A', 'B'],
              correctAnswer: 'A',
              points: 5,
            },
          ],
        },
        instructorUser,
      );

      expect(res.success).toBe(true);
      expect(res.data.id).toBe(mockQuizId);
      expect(res.data.questions).toHaveLength(1);
    });
  });

  describe('startQuiz (Timed quiz taking)', () => {
    const mockQuizContext = {
      quiz_id: mockQuizId,
      quiz_title: 'Security Quiz',
      description: 'Test your security knowledge',
      pass_score: 80,
      time_limit_minutes: 15,
      max_attempts: 3,
      shuffle_questions: false,
      lesson_id: mockLessonId,
      lesson_title: 'Token Auth',
      section_id: 'sec-1',
      course_id: mockCourseId,
      course_title: 'Web Dev',
      instructor_id: instructorUser.userId,
    };

    it('should reject if student is not enrolled', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(mockQuizContext)
        .mockResolvedValueOnce(null); // No enrollment

      await expect(service.startQuiz(mockQuizId, studentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should start a new timed attempt and return questions without correct answers', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(mockQuizContext) // getQuizContext
        .mockResolvedValueOnce({ id: 'enr-1', status: 'active' }); // enrollment

      mockDb.query
        .mockResolvedValueOnce([
          {
            id: 'q-1',
            prompt: 'Question 1',
            question_type: 'multiple_choice',
            points: 5,
            options: '["Option A", "Option B"]',
            order_index: 1,
          },
        ]) // questions
        .mockResolvedValueOnce([]); // no existing submissions

      mockDb.queryOne.mockResolvedValueOnce({
        id: 'sub-new-1',
        quiz_id: mockQuizId,
        student_id: studentUser.userId,
        status: 'in_progress',
        started_at: new Date(),
        attempt_number: 1,
      });

      const res = await service.startQuiz(mockQuizId, studentUser);

      expect(res.success).toBe(true);
      expect(res.data.submissionId).toBe('sub-new-1');
      expect(res.data.timeLimitMinutes).toBe(15);
      expect(res.data.remainingSeconds).toBe(15 * 60);
      expect(res.data.questions).toHaveLength(1);
      expect((res.data.questions[0] as any).correctAnswer).toBeUndefined();
    });

    it('should resume an ongoing in-progress attempt with remaining seconds', async () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      mockDb.queryOne
        .mockResolvedValueOnce(mockQuizContext)
        .mockResolvedValueOnce({ id: 'enr-1', status: 'active' });

      mockDb.query
        .mockResolvedValueOnce([
          {
            id: 'q-1',
            prompt: 'Question 1',
            question_type: 'multiple_choice',
            points: 5,
            options: ['A', 'B'],
            order_index: 1,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'sub-existing-1',
            quiz_id: mockQuizId,
            student_id: studentUser.userId,
            status: 'in_progress',
            started_at: tenMinutesAgo,
            attempt_number: 1,
          },
        ]);

      const res = await service.startQuiz(mockQuizId, studentUser);

      expect(res.success).toBe(true);
      expect(res.message).toContain('làm dở');
      expect(res.data.submissionId).toBe('sub-existing-1');
      expect(res.data.remainingSeconds).toBeLessThanOrEqual(5 * 60);
      expect(res.data.remainingSeconds).toBeGreaterThan(0);
    });

    it('should reject if student has exceeded max attempts', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(mockQuizContext) // max_attempts = 3
        .mockResolvedValueOnce({ id: 'enr-1', status: 'active' });

      mockDb.query
        .mockResolvedValueOnce([
          { id: 'q-1', prompt: 'Q1', points: 5, options: [] },
        ])
        .mockResolvedValueOnce([
          { id: 's1', status: 'graded' },
          { id: 's2', status: 'graded' },
          { id: 's3', status: 'graded' },
        ]); // 3 graded attempts

      await expect(service.startQuiz(mockQuizId, studentUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('submitQuiz (Auto-grading engine)', () => {
    const mockQuizContext = {
      quiz_id: mockQuizId,
      quiz_title: 'Security Quiz',
      pass_score: 80,
      time_limit_minutes: 15,
      lesson_id: mockLessonId,
      course_id: mockCourseId,
      instructor_id: instructorUser.userId,
    };

    it('should throw if no active submission is found', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(mockQuizContext)
        .mockResolvedValueOnce(null);

      await expect(
        service.submitQuiz(mockQuizId, { answers: [] }, studentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should auto-grade all correct answers, score 100%, and mark lesson completed', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(mockQuizContext)
        .mockResolvedValueOnce({
          id: 'sub-1',
          quiz_id: mockQuizId,
          student_id: studentUser.userId,
          status: 'in_progress',
          started_at: new Date(Date.now() - 300000), // 5 mins ago
          attempt_number: 1,
        });

      mockDb.query
        .mockResolvedValueOnce([
          {
            id: 'q-1',
            prompt: 'Question 1',
            points: 5,
            options: ['A', 'B'],
            correct_answer: 'A',
            explanation: 'A is right',
            order_index: 1,
          },
          {
            id: 'q-2',
            prompt: 'Question 2',
            points: 5,
            options: ['C', 'D'],
            correct_answer: 'D',
            explanation: 'D is right',
            order_index: 2,
          },
        ]) // questions
        .mockResolvedValueOnce([]) // update submission
        .mockResolvedValueOnce([]); // progress_records update

      const res = await service.submitQuiz(
        mockQuizId,
        {
          answers: [
            { questionId: 'q-1', answer: 'A' },
            { questionId: 'q-2', answer: 'D' },
          ],
        },
        studentUser,
      );

      expect(res.success).toBe(true);
      expect(res.data.finalScore).toBe(100);
      expect(res.data.isPassed).toBe(true);
      expect(res.data.correctCount).toBe(2);
      expect(res.data.totalQuestions).toBe(2);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO progress_records'),
        expect.any(Array),
      );
    });

    it('should auto-grade partially correct answers and fail if below passScore', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(mockQuizContext) // pass_score = 80
        .mockResolvedValueOnce({
          id: 'sub-1',
          quiz_id: mockQuizId,
          student_id: studentUser.userId,
          status: 'in_progress',
          started_at: new Date(),
          attempt_number: 1,
        });

      mockDb.query
        .mockResolvedValueOnce([
          {
            id: 'q-1',
            prompt: 'Question 1',
            points: 5,
            options: ['A', 'B'],
            correct_answer: 'A',
            explanation: 'A is right',
            order_index: 1,
          },
          {
            id: 'q-2',
            prompt: 'Question 2',
            points: 5,
            options: ['C', 'D'],
            correct_answer: 'D',
            explanation: 'D is right',
            order_index: 2,
          },
        ])
        .mockResolvedValueOnce([]);

      const res = await service.submitQuiz(
        mockQuizId,
        {
          answers: [
            { questionId: 'q-1', answer: 'A' },
            { questionId: 'q-2', answer: 'C' }, // Incorrect
          ],
        },
        studentUser,
      );

      expect(res.success).toBe(true);
      expect(res.data.finalScore).toBe(50);
      expect(res.data.isPassed).toBe(false);
      expect(res.data.correctCount).toBe(1);
    });
  });

  describe('getQuizAnalytics', () => {
    it('should return metrics for instructor', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce({
          quiz_id: mockQuizId,
          quiz_title: 'Quiz 1',
          pass_score: 80,
          lesson_id: mockLessonId,
          instructor_id: instructorUser.userId,
        })
        .mockResolvedValueOnce({
          lesson_id: mockLessonId,
          course_id: mockCourseId,
          instructor_id: instructorUser.userId,
        });

      mockDb.query.mockResolvedValueOnce([
        { id: 's1', student_id: 'u1', score: 90, status: 'graded', time_spent_seconds: 300 },
        { id: 's2', student_id: 'u2', score: 60, status: 'graded', time_spent_seconds: 400 },
      ]);

      const res = await service.getQuizAnalytics(mockQuizId, instructorUser);

      expect(res.success).toBe(true);
      expect(res.data.totalSubmissions).toBe(2);
      expect(res.data.uniqueStudents).toBe(2);
      expect(res.data.averageScore).toBe(75);
      expect(res.data.passRate).toBe(50);
    });
  });
});
