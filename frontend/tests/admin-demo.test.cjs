// Executes pure domain logic with the existing TypeScript dependency.
// Full static type checking remains a separate tsc check.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    filename,
  );
const { createAdminDemo } = require("../src/lib/mock-admin-data.ts");
const {
  adminDemoReducer: reduce,
  demoMetrics,
  enrollmentTrend,
  paginate,
  ratio,
} = require("../src/lib/admin-demo.ts");
let checks = 0;
function check(name, fn) {
  fn();
  checks++;
  console.log(`PASS ${name}`);
}
check("deterministic fixture and relational integrity", () => {
  const s = createAdminDemo();
  assert.deepEqual(s, createAdminDemo());
  const pairs = new Set();
  for (const e of s.enrollments) {
    assert(s.users.some((u) => u.id === e.studentId && u.role === "student"));
    assert(s.courses.some((c) => c.id === e.courseId));
    assert(!pairs.has(e.studentId + e.courseId));
    pairs.add(e.studentId + e.courseId);
    if (e.status === "completed") assert.equal(e.progress.percentage, 100);
  }
  for (const c of s.courses)
    assert(
      s.users.some((u) => u.id === c.instructorId && u.role === "instructor"),
    );
  for (const r of s.reports) {
    assert(s.users.some((u) => u.id === r.reporterId));
    assert(s.users.some((u) => u.id === r.target.authorId));
    assert(s.courses.some((c) => c.id === r.target.courseId));
    assert(["Comment", "Discussion thread"].includes(r.target.type));
  }
  for (const a of s.quizAttempts)
    assert(
      s.enrollments.some(
        (e) => e.studentId === a.studentId && e.courseId === a.courseId,
      ),
    );
});
check(
  "metrics exclude cancelled/suspended and handle missing denominators",
  () => {
    const s = createAdminDemo();
    assert.deepEqual(demoMetrics(s), {
      active: 6,
      completed: 6,
      completionRate: 50,
      averageScore: 74.3,
      passRate: 66.7,
      attempts: 12,
    });
    assert.deepEqual(
      enrollmentTrend(s).map((r) => r.count),
      [8, 8, 8],
    );
    assert.equal(demoMetrics(s, "course-7").completionRate, null);
    assert.equal(ratio(0, 0), null);
    const empty = demoMetrics({ ...s, enrollments: [], quizAttempts: [] });
    assert.equal(empty.averageScore, null);
    assert.equal(empty.passRate, null);
    assert.equal(empty.completionRate, null);
    assert.equal(
      demoMetrics({
        ...s,
        enrollments: s.enrollments.filter((e) => e.status !== "completed"),
      }).completionRate,
      0,
    );
  },
);
check(
  "repeat attempts use attempt weighting and each attempt's pass score",
  () => {
    const s = createAdminDemo();
    const quizAttempts = [
      {
        id: "repeat-1",
        courseId: "course-1",
        studentId: "user-6",
        score: 100,
        passScore: 100,
      },
      {
        id: "repeat-2",
        courseId: "course-1",
        studentId: "user-6",
        score: 40,
        passScore: 30,
      },
      {
        id: "repeat-3",
        courseId: "course-1",
        studentId: "user-6",
        score: 40,
        passScore: 50,
      },
      {
        id: "repeat-4",
        courseId: "course-1",
        studentId: "user-7",
        score: 20,
        passScore: 10,
      },
    ];
    const metrics = demoMetrics({ ...s, quizAttempts });
    assert.equal(metrics.attempts, 4);
    // Attempt average = 50; averaging each learner's average would produce 40.
    assert.equal(metrics.averageScore, 50);
    // Equal scores of 40 pass at 30 and fail at 50; the boundary score also passes.
    assert.equal(metrics.passRate, 75);
  },
);
check("course metrics exclude other courses' enrollments and attempts", () => {
  const s = createAdminDemo();
  const enrollments = [
    ...["active", "completed", "cancelled", "suspended"].map((status, i) => ({
      ...s.enrollments[i * 6],
      id: `scoped-${i + 1}`,
      courseId: "course-1",
      status,
    })),
    ...["completed", "completed", "active"].map((status, i) => ({
      ...s.enrollments[i * 6 + 1],
      id: `other-${i + 1}`,
      courseId: "course-2",
      status,
    })),
  ];
  const quizAttempts = [
    {
      id: "scoped-attempt-1",
      courseId: "course-1",
      studentId: "user-6",
      score: 25,
      passScore: 25,
    },
    {
      id: "scoped-attempt-2",
      courseId: "course-1",
      studentId: "user-7",
      score: 75,
      passScore: 80,
    },
    {
      id: "other-attempt-1",
      courseId: "course-2",
      studentId: "user-6",
      score: 100,
      passScore: 100,
    },
    {
      id: "other-attempt-2",
      courseId: "course-2",
      studentId: "user-7",
      score: 100,
      passScore: 100,
    },
  ];
  const state = { ...s, enrollments, quizAttempts };
  assert.deepEqual(demoMetrics(state, "course-1"), {
    active: 1,
    completed: 1,
    completionRate: 50,
    averageScore: 50,
    passRate: 50,
    attempts: 2,
  });
  const withoutOtherCourses = {
    ...state,
    enrollments: enrollments.filter((e) => e.courseId === "course-1"),
    quizAttempts: quizAttempts.filter((a) => a.courseId === "course-1"),
  };
  assert.deepEqual(
    demoMetrics(state, "course-1"),
    demoMetrics(withoutOtherCourses),
  );
  assert.notDeepEqual(demoMetrics(state), demoMetrics(state, "course-1"));
});
check("role/publication changes are immutable and skip no-ops", () => {
  const s = createAdminDemo();
  assert.equal(reduce(s, { type: "role", id: "user-6", role: "student" }), s);
  assert.equal(reduce(s, { type: "role", id: "missing", role: "admin" }), s);
  const next = reduce(s, { type: "role", id: "user-6", role: "instructor" });
  assert.equal(next.users[5].role, "instructor");
  assert.equal(s.users[5].role, "student");
  assert.equal(next.events.length, s.events.length + 1);
  assert.equal(next.events[0].action, "Role changed");
  assert.equal(
    reduce(next, { type: "role", id: "user-6", role: "instructor" }),
    next,
  );
  const pub = reduce(next, {
    type: "publication",
    id: "course-7",
    isPublished: true,
  });
  assert(pub.courses[6].isPublished);
  assert.equal(pub.events[0].action, "Publication changed");
  assert.equal(
    reduce(pub, { type: "publication", id: "course-7", isPublished: true }),
    pub,
  );
});
check("review trims notes, records event and never edits content", () => {
  const s = createAdminDemo();
  assert.equal(
    reduce(s, {
      type: "review",
      id: "report-1",
      status: "Resolved",
      note: " ",
    }),
    s,
  );
  const action = {
    type: "review",
    id: "report-1",
    status: "Resolved",
    note: "  Reviewed context.  ",
  };
  const next = reduce(s, action);
  assert.equal(next.reports[0].review.note, "Reviewed context.");
  assert.equal(next.reports[0].status, "Resolved");
  assert.deepEqual(next.reports[0].target, s.reports[0].target);
  assert.equal(next.events[0].action, "Report reviewed");
  assert.equal(next.events[0].timestamp, next.reports[0].review.reviewedAt);
  assert.equal(reduce(next, action), next);
  const revised = reduce(next, {
    ...action,
    status: "Dismissed",
    note: "No further handling.",
  });
  assert.equal(revised.events.length, s.events.length + 2);
  assert.notEqual(revised.events[0].id, revised.events[1].id);
  assert(revised.events[0].timestamp > revised.events[1].timestamp);
});
check(
  "reset restores fixture, metrics, report states and audit history",
  () => {
    let s = reduce(createAdminDemo(), {
      type: "role",
      id: "user-6",
      role: "admin",
    });
    s = reduce(s, { type: "publication", id: "course-7", isPublished: true });
    s = reduce(s, {
      type: "review",
      id: "report-1",
      status: "Dismissed",
      note: "Demo note",
    });
    assert.deepEqual(reduce(s, { type: "reset" }), createAdminDemo());
  },
);
check("pagination clamps after full-dataset filtering and changes", () => {
  const users = createAdminDemo().users;
  assert.equal(paginate(users, 3).rows.length, 4);
  const filtered = users.filter((u) => u.role === "instructor");
  assert.deepEqual(paginate(filtered, 3).rows, filtered);
  assert.equal(paginate(filtered, 3).page, 1);
  assert.deepEqual(paginate([], 99), {
    rows: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });
});
console.log(`${checks} domain checks passed.`);
