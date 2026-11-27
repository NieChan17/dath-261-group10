import { Pool, PoolClient } from 'pg';
import { getSeedAccountSpecs, runSeed } from './seed.runner';

describe('seed.runner', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.DISABLE_DEMO_SEED;
    delete process.env.SEED_ADMIN_PASSWORD;
    delete process.env.SEED_INSTRUCTOR_PASSWORD;
    delete process.env.SEED_STUDENT_PASSWORD;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('builds distinct demo account specifications matching login defaults', () => {
    const specs = getSeedAccountSpecs({});

    expect(specs.map((s) => [s.role, s.email])).toEqual([
      ['admin', 'admin@edupulse.hcmut.edu.vn'],
      ['instructor', 'instructor@edupulse.hcmut.edu.vn'],
      ['instructor', 'linh.instructor@edupulse.hcmut.edu.vn'],
      ['student', 'student@edupulse.hcmut.edu.vn'],
      ['student', 'hoa.student@edupulse.hcmut.edu.vn'],
    ]);

    expect(specs[0].password).toBe('Admin@123456');
    expect(specs[1].password).toBe('Instructor@123456');
    expect(specs[3].password).toBe('Student@123456');
    expect(specs.every((s) => s.usesDefaultPassword)).toBe(true);
  });

  it('allows overriding seeded credentials via environment variables', () => {
    const specs = getSeedAccountSpecs({
      SEED_ADMIN_PASSWORD: 'CustomAdmin!2026',
      SEED_INSTRUCTOR_PASSWORD: 'CustomInstructor!2026',
      SEED_STUDENT_PASSWORD: 'CustomStudent!2026',
    });

    expect(specs[0].password).toBe('CustomAdmin!2026');
    expect(specs[1].password).toBe('CustomInstructor!2026');
    expect(specs[3].password).toBe('CustomStudent!2026');
    expect(specs.every((s) => !s.usesDefaultPassword)).toBe(true);
  });

  it('skips seeding cleanly when DISABLE_DEMO_SEED=true', async () => {
    process.env.DISABLE_DEMO_SEED = 'true';
    const connectSpy = jest.fn();
    const fakePool = { connect: connectSpy } as unknown as Pool;

    const summary = await runSeed(fakePool);

    expect(summary.skipped).toBe(true);
    expect(summary.users).toBe(0);
    expect(connectSpy).not.toHaveBeenCalled();
  });

  it('executes idempotently inside a PostgreSQL transaction using ON CONFLICT upserts', async () => {
    const queries: string[] = [];
    let counter = 0;

    const fakeClient = {
      query: jest.fn(async (sql: string) => {
        queries.push(sql);
        if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
          return { rows: [] };
        }
        return { rows: [{ id: `00000000-0000-0000-0000-0000000000${++counter}` }] };
      }),
      release: jest.fn(),
    } as unknown as PoolClient;

    const fakePool = {
      connect: jest.fn(async () => fakeClient),
    } as unknown as Pool;

    const summary = await runSeed(fakePool);

    expect(summary).toEqual({
      skipped: false,
      roles: 3,
      users: 5,
      courses: 4,
      enrollments: 4,
      quizzes: 1,
      discussions: 1,
    });
    expect(queries[0]).toBe('BEGIN');
    expect(queries[queries.length - 1]).toBe('COMMIT');
    expect(queries.some((q) => q.includes('ON CONFLICT (email) DO UPDATE'))).toBe(true);
    expect(queries.some((q) => q.includes('ON CONFLICT (code) DO UPDATE'))).toBe(true);
  });
});
