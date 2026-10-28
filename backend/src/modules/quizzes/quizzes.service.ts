import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles.enum';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly db: DatabaseService) {}

  // ---------------------------------------------------------------------------
  // Helper Checks
  // ---------------------------------------------------------------------------
  private async getQuizContext(quizId: string) {
    const context = await this.db.queryOne<{
      quiz_id: string;
      quiz_title: string;
      description: string | null;
      pass_score: number;
      time_limit_minutes: number | null;
      max_attempts: number | null;
      shuffle_questions: boolean;
      lesson_id: string;
      lesson_title: string;
      section_id: string;
      course_id: string;
      course_title: string;
      instructor_id: string;
    }>(
      `SELECT q.id AS quiz_id, q.title AS quiz_title, q.description,
              q.pass_score, q.time_limit_minutes, q.max_attempts, q.shuffle_questions,
              l.id AS lesson_id, l.title AS lesson_title,
              s.id AS section_id,
              c.id AS course_id, c.title AS course_title, c.instructor_id
       FROM quizzes q
       JOIN lessons l ON q.lesson_id = l.id
       JOIN sections s ON l.section_id = s.id
       JOIN courses c ON s.course_id = c.id
       WHERE q.id = $1`,
      [quizId],
    );

    if (!context) {
      throw new NotFoundException(`Không tìm thấy bài trắc nghiệm với ID: ${quizId}`);
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
      throw new ForbiddenException('Bạn không có quyền quản lý bài thi của khóa học này');
    }
    return res;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // ---------------------------------------------------------------------------
  // 1. Quản lý Quiz (Giảng viên / Admin)
  // ---------------------------------------------------------------------------
  async createQuiz(lessonId: string, dto: CreateQuizDto, user: CurrentUserPayload) {
    await this.verifyLessonOwnership(lessonId, user);

    const existing = await this.db.queryOne(
      'SELECT id FROM quizzes WHERE lesson_id = $1',
      [lessonId],
    );
    if (existing) {
      throw new BadRequestException('Bài học này đã có một bài trắc nghiệm');
    }

    return this.db.transaction(async (client) => {
      const quizRes = await client.query(
        `INSERT INTO quizzes (lesson_id, title, description, pass_score, time_limit_minutes, max_attempts, shuffle_questions)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          lessonId,
          dto.title.trim(),
          dto.description || null,
          dto.passScore ?? 80,
          dto.timeLimitMinutes ?? 15,
          dto.maxAttempts ?? null,
          dto.shuffleQuestions ?? false,
        ],
      );
      const newQuiz = quizRes.rows[0];

      // Đổi content_type của bài học sang 'quiz' nếu cần
      await client.query(
        "UPDATE lessons SET content_type = 'quiz' WHERE id = $1",
        [lessonId],
      );

      const createdQuestions: any[] = [];
      if (dto.questions && dto.questions.length > 0) {
        let order = 1;
        for (const q of dto.questions) {
          const qRes = await client.query(
            `INSERT INTO questions (quiz_id, prompt, question_type, points, options, correct_answer, explanation, order_index)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
              newQuiz.id,
              q.prompt.trim(),
              q.questionType || 'multiple_choice',
              q.points ?? 1,
              JSON.stringify(q.options || []),
              q.correctAnswer.trim(),
              q.explanation || null,
              q.orderIndex ?? order++,
            ],
          );
          createdQuestions.push(qRes.rows[0]);
        }
      }

      return {
        success: true,
        message: 'Tạo bài trắc nghiệm thành công',
        data: {
          ...newQuiz,
          passScore: Number(newQuiz.pass_score),
          questions: createdQuestions,
        },
      };
    });
  }

  async getQuizDetail(quizId: string, user: CurrentUserPayload) {
    const ctx = await this.getQuizContext(quizId);
    const isInstructorOrAdmin =
      user.role === Role.ADMIN || user.userId === ctx.instructor_id;

    const questions = await this.db.query(
      `SELECT id, prompt, question_type, points, options, order_index, explanation,
              ${isInstructorOrAdmin ? 'correct_answer' : 'NULL as correct_answer'}
       FROM questions
       WHERE quiz_id = $1
       ORDER BY order_index ASC`,
      [quizId],
    );

    return {
      success: true,
      data: {
        id: ctx.quiz_id,
        title: ctx.quiz_title,
        description: ctx.description,
        passScore: Number(ctx.pass_score),
        timeLimitMinutes: ctx.time_limit_minutes,
        maxAttempts: ctx.max_attempts,
        shuffleQuestions: ctx.shuffle_questions,
        lesson: { id: ctx.lesson_id, title: ctx.lesson_title },
        course: { id: ctx.course_id, title: ctx.course_title },
        questions: questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          questionType: q.question_type,
          points: Number(q.points),
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
          orderIndex: q.order_index,
          explanation: isInstructorOrAdmin ? q.explanation : undefined,
          correctAnswer: isInstructorOrAdmin ? q.correct_answer : undefined,
        })),
      },
    };
  }

  async updateQuiz(quizId: string, dto: UpdateQuizDto, user: CurrentUserPayload) {
    const ctx = await this.getQuizContext(quizId);
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
      values.push(dto.description);
    }
    if (dto.passScore !== undefined) {
      fields.push(`pass_score = $${idx++}`);
      values.push(dto.passScore);
    }
    if (dto.timeLimitMinutes !== undefined) {
      fields.push(`time_limit_minutes = $${idx++}`);
      values.push(dto.timeLimitMinutes);
    }
    if (dto.maxAttempts !== undefined) {
      fields.push(`max_attempts = $${idx++}`);
      values.push(dto.maxAttempts);
    }
    if (dto.shuffleQuestions !== undefined) {
      fields.push(`shuffle_questions = $${idx++}`);
      values.push(dto.shuffleQuestions);
    }

    if (fields.length === 0) {
      throw new BadRequestException('Không có trường nào để cập nhật');
    }

    values.push(quizId);
    const updated = await this.db.queryOne(
      `UPDATE quizzes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    return {
      success: true,
      message: 'Cập nhật bài trắc nghiệm thành công',
      data: updated,
    };
  }

  async deleteQuiz(quizId: string, user: CurrentUserPayload) {
    const ctx = await this.getQuizContext(quizId);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    await this.db.query('DELETE FROM quizzes WHERE id = $1', [quizId]);
    return {
      success: true,
      message: 'Xóa bài trắc nghiệm thành công',
    };
  }

  // ---------------------------------------------------------------------------
  // 2. Quản lý Câu hỏi trong Quiz
  // ---------------------------------------------------------------------------
  async addQuestion(quizId: string, dto: CreateQuestionDto, user: CurrentUserPayload) {
    const ctx = await this.getQuizContext(quizId);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    let order = dto.orderIndex;
    if (order === undefined || order === null) {
      const maxOrder = await this.db.queryOne<{ max_order: number | null }>(
        'SELECT MAX(order_index) as max_order FROM questions WHERE quiz_id = $1',
        [quizId],
      );
      order = (maxOrder?.max_order ?? 0) + 1;
    }

    const created = await this.db.queryOne(
      `INSERT INTO questions (quiz_id, prompt, question_type, points, options, correct_answer, explanation, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        quizId,
        dto.prompt.trim(),
        dto.questionType || 'multiple_choice',
        dto.points ?? 1,
        JSON.stringify(dto.options || []),
        dto.correctAnswer.trim(),
        dto.explanation || null,
        order,
      ],
    );

    return {
      success: true,
      message: 'Thêm câu hỏi thành công',
      data: created,
    };
  }

  async updateQuestion(questionId: string, dto: UpdateQuestionDto, user: CurrentUserPayload) {
    const q = await this.db.queryOne<{ quiz_id: string }>(
      'SELECT quiz_id FROM questions WHERE id = $1',
      [questionId],
    );
    if (!q) throw new NotFoundException('Không tìm thấy câu hỏi');

    const ctx = await this.getQuizContext(q.quiz_id);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.prompt !== undefined) {
      fields.push(`prompt = $${idx++}`);
      values.push(dto.prompt.trim());
    }
    if (dto.questionType !== undefined) {
      fields.push(`question_type = $${idx++}`);
      values.push(dto.questionType);
    }
    if (dto.points !== undefined) {
      fields.push(`points = $${idx++}`);
      values.push(dto.points);
    }
    if (dto.options !== undefined) {
      fields.push(`options = $${idx++}`);
      values.push(JSON.stringify(dto.options));
    }
    if (dto.correctAnswer !== undefined) {
      fields.push(`correct_answer = $${idx++}`);
      values.push(dto.correctAnswer.trim());
    }
    if (dto.explanation !== undefined) {
      fields.push(`explanation = $${idx++}`);
      values.push(dto.explanation);
    }
    if (dto.orderIndex !== undefined) {
      fields.push(`order_index = $${idx++}`);
      values.push(dto.orderIndex);
    }

    if (fields.length === 0) {
      throw new BadRequestException('Không có trường nào để cập nhật');
    }

    values.push(questionId);
    const updated = await this.db.queryOne(
      `UPDATE questions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    return {
      success: true,
      message: 'Cập nhật câu hỏi thành công',
      data: updated,
    };
  }

  async deleteQuestion(questionId: string, user: CurrentUserPayload) {
    const q = await this.db.queryOne<{ quiz_id: string }>(
      'SELECT quiz_id FROM questions WHERE id = $1',
      [questionId],
    );
    if (!q) throw new NotFoundException('Không tìm thấy câu hỏi');

    const ctx = await this.getQuizContext(q.quiz_id);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    await this.db.query('DELETE FROM questions WHERE id = $1', [questionId]);
    return {
      success: true,
      message: 'Xóa câu hỏi thành công',
    };
  }

  // ---------------------------------------------------------------------------
  // 3. API Học viên: Làm bài trắc nghiệm tính giờ (Start Timed Quiz)
  // ---------------------------------------------------------------------------
  async startQuiz(quizId: string, user: CurrentUserPayload) {
    if (user.role !== Role.STUDENT && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Chỉ học viên mới có thể thực hiện làm bài kiểm tra');
    }

    const ctx = await this.getQuizContext(quizId);

    // Kiểm tra đăng ký khóa học nếu là sinh viên
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

    // Lấy danh sách câu hỏi (bảo mật: không gửi correct_answer)
    let questions = await this.db.query<{
      id: string;
      prompt: string;
      question_type: string;
      points: number;
      options: any;
      order_index: number;
    }>(
      `SELECT id, prompt, question_type, points, options, order_index
       FROM questions
       WHERE quiz_id = $1
       ORDER BY order_index ASC`,
      [quizId],
    );

    if (questions.length === 0) {
      throw new BadRequestException('Bài trắc nghiệm này chưa có câu hỏi');
    }

    if (ctx.shuffle_questions) {
      questions = this.shuffleArray(questions);
    }

    const timeLimitMinutes = ctx.time_limit_minutes;
    const timeLimitSeconds = timeLimitMinutes ? timeLimitMinutes * 60 : null;

    // Kiểm tra xem có phiên làm bài dở dang không
    const existing = await this.db.query(
      `SELECT id, quiz_id, student_id, score, status, started_at, attempt_number
       FROM submissions
       WHERE quiz_id = $1 AND student_id = $2
       ORDER BY started_at DESC`,
      [quizId, user.userId],
    );

    const activeAttempt = existing.find(
      (s) => s.status === 'in_progress' || s.status === 'draft',
    );

    if (activeAttempt) {
      const startedAt = new Date(activeAttempt.started_at);
      const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);

      // Nếu đã hết giờ làm bài (kèm 60s buffer)
      if (timeLimitSeconds && elapsedSeconds > timeLimitSeconds + 60) {
        // Tự động đóng phiên làm bài quá hạn
        await this.db.query(
          "UPDATE submissions SET status = 'submitted', score = 0, completed_at = NOW(), time_spent_seconds = $1 WHERE id = $2",
          [timeLimitSeconds, activeAttempt.id],
        );
      } else {
        const remainingSeconds = timeLimitSeconds
          ? Math.max(0, timeLimitSeconds - elapsedSeconds)
          : null;
        const expiresAt = timeLimitSeconds
          ? new Date(startedAt.getTime() + timeLimitSeconds * 1000).toISOString()
          : null;

        return {
          success: true,
          message: 'Tiếp tục bài kiểm tra đang làm dở',
          data: {
            submissionId: activeAttempt.id,
            attemptNumber: activeAttempt.attempt_number,
            quizId: ctx.quiz_id,
            title: ctx.quiz_title,
            description: ctx.description,
            timeLimitMinutes,
            startedAt: startedAt.toISOString(),
            expiresAt,
            remainingSeconds,
            totalQuestions: questions.length,
            questions: questions.map((q) => ({
              id: q.id,
              prompt: q.prompt,
              questionType: q.question_type,
              points: Number(q.points),
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
              orderIndex: q.order_index,
            })),
          },
        };
      }
    }

    // Kiểm tra số lần làm bài tối đa
    const completedAttempts = existing.filter(
      (s) => s.status === 'graded' || s.status === 'submitted',
    ).length;

    if (ctx.max_attempts && completedAttempts >= ctx.max_attempts) {
      throw new BadRequestException(
        `Bạn đã hết số lần làm bài quy định (${ctx.max_attempts} lần)`,
      );
    }

    // Khởi tạo phiên làm bài mới
    const nextAttemptNumber = completedAttempts + 1;
    const now = new Date();
    const expiresAt = timeLimitSeconds
      ? new Date(now.getTime() + timeLimitSeconds * 1000).toISOString()
      : null;

    const newSub = await this.db.queryOne(
      `INSERT INTO submissions (quiz_id, student_id, status, started_at, attempt_number, answers)
       VALUES ($1, $2, 'in_progress', NOW(), $3, '{}'::jsonb)
       RETURNING id, quiz_id, student_id, status, started_at, attempt_number`,
      [quizId, user.userId, nextAttemptNumber],
    );

    return {
      success: true,
      message: 'Bắt đầu làm bài trắc nghiệm tính giờ',
      data: {
        submissionId: newSub.id,
        attemptNumber: newSub.attempt_number,
        quizId: ctx.quiz_id,
        title: ctx.quiz_title,
        description: ctx.description,
        timeLimitMinutes,
        startedAt: new Date(newSub.started_at).toISOString(),
        expiresAt,
        remainingSeconds: timeLimitSeconds,
        totalQuestions: questions.length,
        questions: questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          questionType: q.question_type,
          points: Number(q.points),
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
          orderIndex: q.order_index,
        })),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // 4. API Học viên: Nộp bài & Chấm tự động trắc nghiệm (Submit & Auto-Grade)
  // ---------------------------------------------------------------------------
  async submitQuiz(quizId: string, dto: SubmitQuizDto, user: CurrentUserPayload) {
    if (user.role !== Role.STUDENT && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Chỉ học viên mới có thể nộp bài');
    }

    const ctx = await this.getQuizContext(quizId);

    // Tìm phiên làm bài đang diễn ra
    let submission: any = null;
    if (dto.submissionId) {
      submission = await this.db.queryOne(
        `SELECT id, quiz_id, student_id, status, started_at, attempt_number
         FROM submissions
         WHERE id = $1 AND quiz_id = $2 AND student_id = $3`,
        [dto.submissionId, quizId, user.userId],
      );
    } else {
      submission = await this.db.queryOne(
        `SELECT id, quiz_id, student_id, status, started_at, attempt_number
         FROM submissions
         WHERE quiz_id = $1 AND student_id = $2 AND status IN ('in_progress', 'draft')
         ORDER BY started_at DESC
         LIMIT 1`,
        [quizId, user.userId],
      );
    }

    if (!submission) {
      throw new BadRequestException(
        'Không tìm thấy phiên làm bài đang diễn ra. Vui lòng bắt đầu làm bài trước.',
      );
    }

    if (submission.status === 'graded') {
      throw new BadRequestException('Bài thi này đã được chấm điểm trước đó');
    }

    const now = new Date();
    const startedAt = new Date(submission.started_at);
    const timeSpentSeconds = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));

    // Lấy toàn bộ câu hỏi và đáp án đúng để thực hiện CHẤM TỰ ĐỘNG
    const questions = await this.db.query<{
      id: string;
      prompt: string;
      question_type: string;
      points: number;
      options: any;
      correct_answer: string;
      explanation: string | null;
      order_index: number;
    }>(
      `SELECT id, prompt, question_type, points, options, correct_answer, explanation, order_index
       FROM questions
       WHERE quiz_id = $1
       ORDER BY order_index ASC`,
      [quizId],
    );

    // Chuyển câu trả lời của học viên thành Map
    const answersMap: Record<string, any> = { ...dto.answersMap };
    if (dto.answers && Array.isArray(dto.answers)) {
      for (const item of dto.answers) {
        answersMap[item.questionId] = item.answer;
      }
    }

    // --- THUẬT TOÁN CHẤM TỰ ĐỘNG (Auto-Grading Engine) ---
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;

    const questionResults = questions.map((q) => {
      const qPoints = Number(q.points) > 0 ? Number(q.points) : 1;
      totalPoints += qPoints;
      const studentAnswer = answersMap[q.id];

      let isCorrect = false;

      if (studentAnswer !== undefined && studentAnswer !== null) {
        if (Array.isArray(studentAnswer)) {
          // Xử lý câu hỏi nhiều lựa chọn (multiple answers)
          const stdAnswers = studentAnswer.map((s) => String(s).trim().toLowerCase()).sort();
          const correctArr = String(q.correct_answer)
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .sort();
          isCorrect = JSON.stringify(stdAnswers) === JSON.stringify(correctArr);
        } else {
          // Xử lý câu hỏi 1 đáp án (chuỗi)
          const stdStr = String(studentAnswer).trim().toLowerCase();
          const corStr = String(q.correct_answer).trim().toLowerCase();
          isCorrect = stdStr === corStr;
        }
      }

      const pointsAwarded = isCorrect ? qPoints : 0;
      if (isCorrect) {
        earnedPoints += pointsAwarded;
        correctCount++;
      }

      return {
        questionId: q.id,
        prompt: q.prompt,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        studentAnswer: studentAnswer ?? null,
        correctAnswer: q.correct_answer,
        isCorrect,
        pointsAwarded,
        maxPoints: qPoints,
        explanation: q.explanation || null,
      };
    });

    // Tính điểm trên thang 100
    const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 10000) / 100 : 0;
    const passScore = Number(ctx.pass_score) || 0;
    const isPassed = finalScore >= passScore;

    const answersReport = {
      summary: {
        totalQuestions: questions.length,
        correctCount,
        incorrectCount: questions.length - correctCount,
        earnedPoints,
        totalPoints,
        finalScore,
        passScore,
        isPassed,
        timeSpentSeconds,
      },
      breakdown: questionResults,
    };

    // Lưu kết quả vào cơ sở dữ liệu
    await this.db.query(
      `UPDATE submissions
       SET score = $1, status = 'graded', answers = $2,
           completed_at = NOW(), submitted_at = NOW(), time_spent_seconds = $3
       WHERE id = $4`,
      [finalScore, JSON.stringify(answersReport), timeSpentSeconds, submission.id],
    );

    // Nếu học viên ĐẠT (isPassed) -> Tự động đánh dấu hoàn thành bài học trong progress_records
    if (isPassed && user.role === Role.STUDENT) {
      await this.db.query(
        `INSERT INTO progress_records (enrollment_id, lesson_id, is_completed, last_position_seconds, updated_at)
         SELECT e.id, $2, true, 0, NOW()
         FROM enrollments e
         WHERE e.student_id = $1 AND e.course_id = $3
         ON CONFLICT (enrollment_id, lesson_id)
         DO UPDATE SET is_completed = true, updated_at = NOW()`,
        [user.userId, ctx.lesson_id, ctx.course_id],
      );
    }

    return {
      success: true,
      message: isPassed
        ? 'Chúc mừng! Bạn đã vượt qua bài kiểm tra thành công.'
        : 'Rất tiếc! Bạn chưa đạt điểm sàn qua bài kiểm tra.',
      data: {
        submissionId: submission.id,
        attemptNumber: submission.attempt_number,
        quizId: ctx.quiz_id,
        title: ctx.quiz_title,
        finalScore,
        passScore,
        isPassed,
        correctCount,
        totalQuestions: questions.length,
        earnedPoints,
        totalPoints,
        timeSpentSeconds,
        submittedAt: now.toISOString(),
        questions: questionResults,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // 5. Xem Lịch sử làm bài & Chi tiết bài nộp
  // ---------------------------------------------------------------------------
  async getMySubmissions(quizId: string, user: CurrentUserPayload) {
    const list = await this.db.query(
      `SELECT id, quiz_id, student_id, score, status, started_at, completed_at,
              submitted_at, attempt_number, time_spent_seconds, answers
       FROM submissions
       WHERE quiz_id = $1 AND student_id = $2
       ORDER BY started_at DESC`,
      [quizId, user.userId],
    );

    return {
      success: true,
      data: list.map((sub) => {
        const answersObj =
          typeof sub.answers === 'string' ? JSON.parse(sub.answers) : sub.answers;
        return {
          id: sub.id,
          attemptNumber: sub.attempt_number,
          status: sub.status,
          score: sub.score !== null ? Number(sub.score) : null,
          timeSpentSeconds: sub.time_spent_seconds,
          startedAt: sub.started_at,
          submittedAt: sub.submitted_at,
          summary: answersObj?.summary || null,
        };
      }),
    };
  }

  async getSubmissionDetail(submissionId: string, user: CurrentUserPayload) {
    const sub = await this.db.queryOne<{
      id: string;
      quiz_id: string;
      student_id: string;
      score: number | null;
      status: string;
      started_at: Date;
      submitted_at: Date;
      completed_at: Date | null;
      attempt_number: number;
      time_spent_seconds: number;
      answers: any;
      student_name: string;
      student_email: string;
      quiz_title: string;
      pass_score: number;
      course_id: string;
      instructor_id: string;
    }>(
      `SELECT s.id, s.quiz_id, s.student_id, s.score, s.status, s.started_at,
              s.submitted_at, s.completed_at, s.attempt_number, s.time_spent_seconds, s.answers,
              u.full_name AS student_name, u.email AS student_email,
              q.title AS quiz_title, q.pass_score,
              c.id AS course_id, c.instructor_id
       FROM submissions s
       JOIN users u ON s.student_id = u.id
       JOIN quizzes q ON s.quiz_id = q.id
       JOIN lessons l ON q.lesson_id = l.id
       JOIN sections sec ON l.section_id = sec.id
       JOIN courses c ON sec.course_id = c.id
       WHERE s.id = $1`,
      [submissionId],
    );

    if (!sub) {
      throw new NotFoundException(`Không tìm thấy bài nộp với ID: ${submissionId}`);
    }

    const isAdmin = user.role === Role.ADMIN;
    const isOwnerStudent = user.userId === sub.student_id;
    const isCourseInstructor = user.userId === sub.instructor_id;

    if (!isAdmin && !isOwnerStudent && !isCourseInstructor) {
      throw new ForbiddenException('Bạn không có quyền xem bài nộp này');
    }

    const answersObj =
      typeof sub.answers === 'string' ? JSON.parse(sub.answers) : sub.answers;

    return {
      success: true,
      data: {
        id: sub.id,
        quizId: sub.quiz_id,
        quizTitle: sub.quiz_title,
        passScore: Number(sub.pass_score),
        student: {
          id: sub.student_id,
          fullName: sub.student_name,
          email: sub.student_email,
        },
        attemptNumber: sub.attempt_number,
        status: sub.status,
        score: sub.score !== null ? Number(sub.score) : null,
        timeSpentSeconds: sub.time_spent_seconds,
        startedAt: sub.started_at,
        submittedAt: sub.submitted_at,
        summary: answersObj?.summary || null,
        breakdown: answersObj?.breakdown || [],
      },
    };
  }

  // ---------------------------------------------------------------------------
  // 6. Thống kê Quiz Analytics (Dành cho Giảng viên / Quản trị)
  // ---------------------------------------------------------------------------
  async getQuizAnalytics(quizId: string, user: CurrentUserPayload) {
    const ctx = await this.getQuizContext(quizId);
    await this.verifyLessonOwnership(ctx.lesson_id, user);

    const submissions = await this.db.query(
      `SELECT s.id, s.student_id, s.score, s.status, s.time_spent_seconds, s.answers
       FROM submissions s
       WHERE s.quiz_id = $1 AND s.status = 'graded'`,
      [quizId],
    );

    const totalSubmissions = submissions.length;
    const uniqueStudents = new Set(submissions.map((s) => s.student_id)).size;

    let totalScoreSum = 0;
    let passedCount = 0;
    const passScore = Number(ctx.pass_score);

    const distribution = {
      under50: 0,
      from50to69: 0,
      from70to84: 0,
      from85to100: 0,
    };

    for (const sub of submissions) {
      const score = Number(sub.score) || 0;
      totalScoreSum += score;
      if (score >= passScore) passedCount++;

      if (score < 50) distribution.under50++;
      else if (score < 70) distribution.from50to69++;
      else if (score < 85) distribution.from70to84++;
      else distribution.from85to100++;
    }

    const averageScore =
      totalSubmissions > 0
        ? Math.round((totalScoreSum / totalSubmissions) * 100) / 100
        : 0;
    const passRate =
      totalSubmissions > 0
        ? Math.round((passedCount / totalSubmissions) * 10000) / 100
        : 0;

    return {
      success: true,
      data: {
        quizId: ctx.quiz_id,
        quizTitle: ctx.quiz_title,
        passScore,
        totalSubmissions,
        uniqueStudents,
        averageScore,
        passRate,
        scoreDistribution: distribution,
      },
    };
  }
}
