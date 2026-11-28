import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';
import { PasswordService } from '../modules/auth/security/password.service';
import { getDatabasePoolSsl } from '../common/config/security.config';

dotenv.config();

export interface SeedAccountSpec {
  id: string;
  role: 'admin' | 'instructor' | 'student';
  email: string;
  password: string;
  fullName: string;
  avatarUrl: string;
  usesDefaultPassword: boolean;
}

export interface SeedSummary {
  skipped: boolean;
  reason?: string;
  roles: number;
  users: number;
  courses: number;
  enrollments: number;
  quizzes: number;
  discussions: number;
}

const DEFAULT_PASSWORDS = {
  admin: 'Admin@123456',
  instructor: 'Instructor@123456',
  student: 'Student@123456',
} as const;

const ROLE_IDS: Record<'admin' | 'instructor' | 'student', string> = {
  admin: '00000000-0000-0000-0000-000000000001',
  instructor: '00000000-0000-0000-0000-000000000002',
  student: '00000000-0000-0000-0000-000000000003',
};

export function getSeedAccountSpecs(
  env: NodeJS.ProcessEnv = process.env,
): SeedAccountSpec[] {
  const adminPassword = env.SEED_ADMIN_PASSWORD?.trim() || DEFAULT_PASSWORDS.admin;
  const instructorPassword =
    env.SEED_INSTRUCTOR_PASSWORD?.trim() || DEFAULT_PASSWORDS.instructor;
  const studentPassword = env.SEED_STUDENT_PASSWORD?.trim() || DEFAULT_PASSWORDS.student;

  return [
    {
      id: '10000000-0000-0000-0000-000000000001',
      role: 'admin',
      email: 'admin@edupulse.hcmut.edu.vn',
      password: adminPassword,
      fullName: 'System Administrator',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Admin',
      usesDefaultPassword: adminPassword === DEFAULT_PASSWORDS.admin,
    },
    {
      id: '20000000-0000-0000-0000-000000000001',
      role: 'instructor',
      email: 'instructor@edupulse.hcmut.edu.vn',
      password: instructorPassword,
      fullName: 'Dr. Minh Nguyen',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Minh',
      usesDefaultPassword: instructorPassword === DEFAULT_PASSWORDS.instructor,
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      role: 'instructor',
      email: 'linh.instructor@edupulse.hcmut.edu.vn',
      password: instructorPassword,
      fullName: 'Prof. Linh Tran',
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Linh',
      usesDefaultPassword: instructorPassword === DEFAULT_PASSWORDS.instructor,
    },
    {
      id: '30000000-0000-0000-0000-000000000001',
      role: 'student',
      email: 'student@edupulse.hcmut.edu.vn',
      fullName: 'An Le',
      password: studentPassword,
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AnLe',
      usesDefaultPassword: studentPassword === DEFAULT_PASSWORDS.student,
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      role: 'student',
      email: 'hoa.student@edupulse.hcmut.edu.vn',
      fullName: 'Hoa Pham',
      password: studentPassword,
      avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Hoa',
      usesDefaultPassword: studentPassword === DEFAULT_PASSWORDS.student,
    },
  ];
}

async function ensureRole(
  client: PoolClient,
  roleName: 'admin' | 'instructor' | 'student',
  permissions: string[],
): Promise<string> {
  await client.query(
    `INSERT INTO roles (id, name, permissions)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (name) DO NOTHING`,
    [ROLE_IDS[roleName], roleName, JSON.stringify(permissions)],
  );

  const existing = await client.query<{ id: string }>(
    'SELECT id FROM roles WHERE name = $1 LIMIT 1',
    [roleName],
  );

  if (!existing.rows[0]?.id) {
    throw new Error(`Failed to resolve role ID for "${roleName}"`);
  }

  return existing.rows[0].id;
}

async function upsertUser(
  client: PoolClient,
  spec: SeedAccountSpec,
  roleId: string,
  passwordHash: string,
): Promise<string> {
  const res = await client.query<{ id: string }>(
    `INSERT INTO users (id, role_id, email, password_hash, full_name, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO UPDATE
       SET role_id = EXCLUDED.role_id,
           password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           avatar_url = EXCLUDED.avatar_url
     RETURNING id`,
    [spec.id, roleId, spec.email, passwordHash, spec.fullName, spec.avatarUrl],
  );
  return res.rows[0].id;
}

async function upsertCourse(
  client: PoolClient,
  course: {
    id: string;
    instructorId: string;
    code: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    isPublished: boolean;
  },
): Promise<string> {
  const res = await client.query<{ id: string }>(
    `INSERT INTO courses (
       id, instructor_id, code, title, description,
       thumbnail_url, category, level, is_published
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (code) DO UPDATE
       SET title = EXCLUDED.title,
           description = EXCLUDED.description,
           thumbnail_url = EXCLUDED.thumbnail_url,
           category = EXCLUDED.category,
           level = EXCLUDED.level,
           is_published = EXCLUDED.is_published
     RETURNING id`,
    [
      course.id,
      course.instructorId,
      course.code,
      course.title,
      course.description,
      course.thumbnailUrl,
      course.category,
      course.level,
      course.isPublished,
    ],
  );
  return res.rows[0].id;
}

async function upsertSection(
  client: PoolClient,
  section: { id: string; courseId: string; title: string; orderIndex: number },
): Promise<string> {
  const res = await client.query<{ id: string }>(
    `INSERT INTO sections (id, course_id, title, order_index)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (course_id, order_index) DO UPDATE
       SET title = EXCLUDED.title
     RETURNING id`,
    [section.id, section.courseId, section.title, section.orderIndex],
  );
  return res.rows[0].id;
}

async function upsertLesson(
  client: PoolClient,
  lesson: {
    id: string;
    sectionId: string;
    title: string;
    contentType: 'video' | 'slides' | 'text' | 'quiz' | 'assignment';
    durationMinutes: number;
    orderIndex: number;
  },
): Promise<string> {
  const res = await client.query<{ id: string }>(
    `INSERT INTO lessons (id, section_id, title, content_type, duration_minutes, order_index)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (section_id, order_index) DO UPDATE
       SET title = EXCLUDED.title,
           content_type = EXCLUDED.content_type,
           duration_minutes = EXCLUDED.duration_minutes
     RETURNING id`,
    [
      lesson.id,
      lesson.sectionId,
      lesson.title,
      lesson.contentType,
      lesson.durationMinutes,
      lesson.orderIndex,
    ],
  );
  return res.rows[0].id;
}

async function upsertEnrollment(
  client: PoolClient,
  enrollment: {
    id: string;
    studentId: string;
    courseId: string;
    status: 'active' | 'completed' | 'cancelled' | 'suspended';
  },
): Promise<string> {
  await client.query(
    `INSERT INTO enrollments (id, student_id, course_id, status, enrolled_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (student_id, course_id) DO NOTHING`,
    [enrollment.id, enrollment.studentId, enrollment.courseId, enrollment.status],
  );

  const existing = await client.query<{ id: string }>(
    'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2 LIMIT 1',
    [enrollment.studentId, enrollment.courseId],
  );
  return existing.rows[0].id;
}

async function upsertProgressRecord(
  client: PoolClient,
  record: {
    id: string;
    enrollmentId: string;
    lessonId: string;
    isCompleted: boolean;
    lastPositionSeconds: number;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO progress_records (id, enrollment_id, lesson_id, is_completed, last_position_seconds)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (enrollment_id, lesson_id) DO NOTHING`,
    [
      record.id,
      record.enrollmentId,
      record.lessonId,
      record.isCompleted,
      record.lastPositionSeconds,
    ],
  );
}

async function ensureQuizWithQuestions(
  client: PoolClient,
  quiz: {
    id: string;
    lessonId: string;
    title: string;
    description: string;
    passScore: number;
    timeLimitMinutes: number;
    maxAttempts: number;
  },
  questions: Array<{
    id: string;
    prompt: string;
    questionType: string;
    points: number;
    options: string[];
    correctAnswer: string;
    explanation: string;
    orderIndex: number;
  }>,
): Promise<string> {
  const existing = await client.query<{ id: string }>(
    'SELECT id FROM quizzes WHERE id = $1 OR lesson_id = $2 LIMIT 1',
    [quiz.id, quiz.lessonId],
  );

  let quizId = existing.rows[0]?.id;
  if (!quizId) {
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO quizzes (
         id, lesson_id, title, description, pass_score,
         time_limit_minutes, max_attempts, shuffle_questions
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
       RETURNING id`,
      [
        quiz.id,
        quiz.lessonId,
        quiz.title,
        quiz.description,
        quiz.passScore,
        quiz.timeLimitMinutes,
        quiz.maxAttempts,
      ],
    );
    quizId = inserted.rows[0].id;
  }

  for (const q of questions) {
    await client.query(
      `INSERT INTO questions (
         id, quiz_id, prompt, question_type, points,
         options, correct_answer, explanation, order_index
       )
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
       ON CONFLICT (quiz_id, order_index) DO UPDATE
         SET prompt = EXCLUDED.prompt,
             options = EXCLUDED.options,
             correct_answer = EXCLUDED.correct_answer,
             explanation = EXCLUDED.explanation`,
      [
        q.id,
        quizId,
        q.prompt,
        q.questionType,
        q.points,
        JSON.stringify(q.options),
        q.correctAnswer,
        q.explanation,
        q.orderIndex,
      ],
    );
  }

  return quizId;
}

async function ensureDiscussionWithReply(
  client: PoolClient,
  thread: {
    id: string;
    lessonId: string;
    authorId: string;
    title: string;
    content: string;
  },
  reply: {
    id: string;
    authorId: string;
    content: string;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO discussion_threads (id, lesson_id, author_id, title, content)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO NOTHING`,
    [thread.id, thread.lessonId, thread.authorId, thread.title, thread.content],
  );

  await client.query(
    `INSERT INTO comments (id, thread_id, author_id, parent_id, content)
     VALUES ($1, $2, $3, NULL, $4)
     ON CONFLICT (id) DO NOTHING`,
    [reply.id, thread.id, reply.authorId, reply.content],
  );
}

export async function runSeed(providedPool?: Pool): Promise<SeedSummary> {
  if (process.env.DISABLE_DEMO_SEED === 'true') {
    console.log('[SeedRunner] Skipping demo seed because DISABLE_DEMO_SEED=true.');
    return {
      skipped: true,
      reason: 'DISABLE_DEMO_SEED=true',
      roles: 0,
      users: 0,
      courses: 0,
      enrollments: 0,
      quizzes: 0,
      discussions: 0,
    };
  }

  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://edupulse_user:secure_staging_password@localhost:5432/edupulse_staging';

  const ssl = getDatabasePoolSsl(connectionString, process.env.DATABASE_SSL);
  const pool =
    providedPool ||
    new Pool({
      connectionString,
      ...(ssl ? { ssl } : {}),
    });

  const passwordService = new PasswordService();
  const accountSpecs = getSeedAccountSpecs(process.env);

  if (
    process.env.NODE_ENV === 'production' &&
    accountSpecs.some((spec) => spec.usesDefaultPassword)
  ) {
    console.warn(
      '[SeedRunner] WARNING: Seeding demo accounts with default passwords in production. Override SEED_ADMIN_PASSWORD, SEED_INSTRUCTOR_PASSWORD, and SEED_STUDENT_PASSWORD or disable seeding after QA verification.',
    );
  }

  const hashedByEmail = new Map<string, string>();
  for (const spec of accountSpecs) {
    hashedByEmail.set(spec.email, await passwordService.hashPassword(spec.password));
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Ensure core RBAC roles exist
    const adminRoleId = await ensureRole(client, 'admin', ['*']);
    const instructorRoleId = await ensureRole(client, 'instructor', [
      'course:create',
      'course:update',
      'quiz:manage',
      'assignment:grade',
    ]);
    const studentRoleId = await ensureRole(client, 'student', [
      'course:read',
      'enrollment:create',
      'quiz:submit',
      'assignment:submit',
    ]);

    const roleIdMap = {
      admin: adminRoleId,
      instructor: instructorRoleId,
      student: studentRoleId,
    };

    // 2. Upsert test/demo users with Argon2id hashes
    const userIdByEmail = new Map<string, string>();
    for (const spec of accountSpecs) {
      const hash = hashedByEmail.get(spec.email)!;
      const userId = await upsertUser(client, spec, roleIdMap[spec.role], hash);
      userIdByEmail.set(spec.email, userId);
    }

    const primaryInstructorId = userIdByEmail.get('instructor@edupulse.hcmut.edu.vn')!;
    const secondaryInstructorId = userIdByEmail.get('linh.instructor@edupulse.hcmut.edu.vn')!;
    const primaryStudentId = userIdByEmail.get('student@edupulse.hcmut.edu.vn')!;
    const secondaryStudentId = userIdByEmail.get('hoa.student@edupulse.hcmut.edu.vn')!;

    // 3. Upsert courses (preserve CO3103 from V009 and add realistic catalog variety)
    const co3103Id = await upsertCourse(client, {
      id: 'c0310300-0000-0000-0000-000000000001',
      instructorId: primaryInstructorId,
      code: 'CO3103',
      title: 'Integrated Software Engineering Project',
      description:
        'Capstone software engineering course covering system design, full-stack delivery, AI integration, automated testing, and DevOps deployment.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=960&q=80',
      category: 'Software Engineering',
      level: 'Intermediate',
      isPublished: true,
    });

    const co3001Id = await upsertCourse(client, {
      id: 'c0300100-0000-0000-0000-000000000001',
      instructorId: primaryInstructorId,
      code: 'CO3001',
      title: 'Cloud-Native Microservices & Production Security',
      description:
        'Design hardened containers, reverse proxies, CI/CD release gates, and OWASP Top 10 defenses for multi-service web platforms.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=960&q=80',
      category: 'DevOps & Security',
      level: 'Intermediate',
      isPublished: true,
    });

    const cs4010Id = await upsertCourse(client, {
      id: 'c0401000-0000-0000-0000-000000000001',
      instructorId: secondaryInstructorId,
      code: 'CS4010',
      title: 'Applied Retrieval-Augmented Generation (RAG)',
      description:
        'Build citation-grounded AI assistants with pgvector embeddings, out-of-scope abstention thresholds, and evaluation benchmarks.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=960&q=80',
      category: 'Artificial Intelligence',
      level: 'Advanced',
      isPublished: true,
    });

    const se4990Id = await upsertCourse(client, {
      id: 'c0499000-0000-0000-0000-000000000001',
      instructorId: primaryInstructorId,
      code: 'SE4990',
      title: 'Threat Modeling & Penetration Testing Lab (Draft)',
      description:
        'Draft instructor workspace demonstrating unpublished course visibility restrictions in student vs. instructor portals.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=960&q=80',
      category: 'Cybersecurity',
      level: 'Advanced',
      isPublished: false,
    });

    // 4. Sections and lessons for CO3001, CS4010, and SE4990
    const co3001Sec1 = await upsertSection(client, {
      id: 'a0300101-0000-0000-0000-000000000001',
      courseId: co3001Id,
      title: 'Module 1: Containers & Reverse Proxy Hardening',
      orderIndex: 1,
    });
    const co3001Sec2 = await upsertSection(client, {
      id: 'a0300102-0000-0000-0000-000000000001',
      courseId: co3001Id,
      title: 'Module 2: CI/CD Release Engineering',
      orderIndex: 2,
    });

    const co3001Lesson1 = await upsertLesson(client, {
      id: 'b0300101-0000-0000-0000-000000000001',
      sectionId: co3001Sec1,
      title: 'Lesson 1.1: Non-Root Multi-Stage Dockerfiles',
      contentType: 'video',
      durationMinutes: 25,
      orderIndex: 1,
    });
    const co3001Lesson2 = await upsertLesson(client, {
      id: 'b0300102-0000-0000-0000-000000000001',
      sectionId: co3001Sec1,
      title: 'Lesson 1.2: Nginx Rate Limiting & Security Headers',
      contentType: 'text',
      durationMinutes: 20,
      orderIndex: 2,
    });
    const co3001QuizLesson = await upsertLesson(client, {
      id: 'b0300103-0000-0000-0000-000000000001',
      sectionId: co3001Sec1,
      title: 'Lesson 1.3: OWASP Hardening Checkpoint Quiz',
      contentType: 'quiz',
      durationMinutes: 15,
      orderIndex: 3,
    });
    await upsertLesson(client, {
      id: 'b0300104-0000-0000-0000-000000000001',
      sectionId: co3001Sec2,
      title: 'Lesson 2.1: Zero-Downtime Database Migrations',
      contentType: 'slides',
      durationMinutes: 30,
      orderIndex: 1,
    });

    const cs4010Sec1 = await upsertSection(client, {
      id: 'a0401001-0000-0000-0000-000000000001',
      courseId: cs4010Id,
      title: 'Module 1: Vector Retrieval & Guardrails',
      orderIndex: 1,
    });
    await upsertLesson(client, {
      id: 'b0401001-0000-0000-0000-000000000001',
      sectionId: cs4010Sec1,
      title: 'Lesson 1.1: Hybrid Search with pgvector',
      contentType: 'video',
      durationMinutes: 35,
      orderIndex: 1,
    });
    await upsertLesson(client, {
      id: 'b0401002-0000-0000-0000-000000000001',
      sectionId: cs4010Sec1,
      title: 'Lesson 1.2: Out-of-Scope Abstention Tuning',
      contentType: 'text',
      durationMinutes: 20,
      orderIndex: 2,
    });

    const se4990Sec1 = await upsertSection(client, {
      id: 'a0499001-0000-0000-0000-000000000001',
      courseId: se4990Id,
      title: 'Module 1: Threat Modeling Foundations',
      orderIndex: 1,
    });
    await upsertLesson(client, {
      id: 'b0499001-0000-0000-0000-000000000001',
      sectionId: se4990Sec1,
      title: 'Lesson 1.1: STRIDE Risk Decomposition',
      contentType: 'text',
      durationMinutes: 30,
      orderIndex: 1,
    });

    // 5. Quiz & questions on CO3001
    await ensureQuizWithQuestions(
      client,
      {
        id: 'c0300104-0000-0000-0000-000000000001',
        lessonId: co3001QuizLesson,
        title: 'OWASP Production Hardening Check',
        description:
          'Verify knowledge of authentication hardening, HTTP security headers, and container least privilege.',
        passScore: 70,
        timeLimitMinutes: 15,
        maxAttempts: 3,
      },
      [
        {
          id: 'd0300104-0000-0000-0000-000000000001',
          prompt: 'Which cookie flag prevents client-side JavaScript from reading session tokens?',
          questionType: 'multiple_choice',
          points: 1,
          options: ['HttpOnly', 'Path=/', 'Max-Age', 'Domain'],
          correctAnswer: 'HttpOnly',
          explanation:
            'HttpOnly prevents document.cookie access from JavaScript, reducing XSS token theft risk.',
          orderIndex: 1,
        },
        {
          id: 'd0300104-0000-0000-0000-000000000002',
          prompt:
            'What should NestJS ValidationPipe set when preventing mass-assignment of unexpected JSON fields?',
          questionType: 'multiple_choice',
          points: 1,
          options: [
            'whitelist: true and forbidNonWhitelisted: true',
            'transform: false only',
            'disableErrorMessages: false',
            'validateCustomDecorators: false',
          ],
          correctAnswer: 'whitelist: true and forbidNonWhitelisted: true',
          explanation:
            'Whitelisting strips unannotated DTO properties and forbidding non-whitelisted fields rejects injected keys with HTTP 400.',
          orderIndex: 2,
        },
      ],
    );

    // 6. Enrollments & learning progress
    await upsertEnrollment(client, {
      id: 'e0310301-0000-0000-0000-000000000001',
      studentId: primaryStudentId,
      courseId: co3103Id,
      status: 'active',
    });

    const primaryCo3001EnrollmentId = await upsertEnrollment(client, {
      id: 'e0300101-0000-0000-0000-000000000001',
      studentId: primaryStudentId,
      courseId: co3001Id,
      status: 'active',
    });

    await upsertEnrollment(client, {
      id: 'e0300102-0000-0000-0000-000000000001',
      studentId: secondaryStudentId,
      courseId: co3001Id,
      status: 'completed',
    });

    await upsertEnrollment(client, {
      id: 'e0401001-0000-0000-0000-000000000001',
      studentId: secondaryStudentId,
      courseId: cs4010Id,
      status: 'active',
    });

    await upsertProgressRecord(client, {
      id: 'f0300101-0000-0000-0000-000000000001',
      enrollmentId: primaryCo3001EnrollmentId,
      lessonId: co3001Lesson1,
      isCompleted: true,
      lastPositionSeconds: 1500,
    });
    await upsertProgressRecord(client, {
      id: 'f0300102-0000-0000-0000-000000000001',
      enrollmentId: primaryCo3001EnrollmentId,
      lessonId: co3001Lesson2,
      isCompleted: false,
      lastPositionSeconds: 420,
    });

    // 7. Discussion thread & instructor reply
    await ensureDiscussionWithReply(
      client,
      {
        id: '70300101-0000-0000-0000-000000000001',
        lessonId: co3001Lesson1,
        authorId: primaryStudentId,
        title: 'Question on non-root USER permissions for upload directories',
        content:
          'When switching to a non-root user in Alpine Dockerfiles, should mounted upload volumes be chowned before USER appuser?',
      },
      {
        id: '80300101-0000-0000-0000-000000000001',
        authorId: primaryInstructorId,
        content:
          'Yes! Always create and chown /app/uploads before declaring USER appuser, or initialize named volumes with matching UID permissions.',
      },
    );

    await client.query('COMMIT');

    const summary: SeedSummary = {
      skipped: false,
      roles: 3,
      users: accountSpecs.length,
      courses: 4,
      enrollments: 4,
      quizzes: 1,
      discussions: 1,
    };

    console.log(
      `[SeedRunner] Completed cleanly: ${summary.users} users (${accountSpecs
        .map((s) => `${s.role}:${s.email}`)
        .join(', ')}), ${summary.courses} courses, ${summary.enrollments} enrollments.`,
    );
    return summary;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[SeedRunner] Transaction rolled back due to error:', error);
    throw error;
  } finally {
    client.release();
    if (!providedPool) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  runSeed()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SeedRunner] Failed:', err);
      process.exit(1);
    });
}
