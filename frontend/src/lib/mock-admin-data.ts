import type { Role, User } from "../types/auth";
import type { AdminDemoState, ContentReport } from "../types/admin";

export function createAdminDemo(): AdminDemoState {
  const names = [
    "Alex Morgan",
    "Jordan Lee",
    "Sam Rivera",
    "Taylor Chen",
    "Casey Patel",
    "Riley Nguyen",
    "Morgan Brooks",
    "Jamie Park",
    "Drew Wilson",
    "Robin Tran",
    "Cameron Reed",
    "Avery Kim",
    "Quinn Davis",
    "Skyler Pham",
  ];
  const users: User[] = names.map((fullName, i) => ({
    id: `user-${i + 1}`,
    fullName,
    email: `${fullName.toLowerCase().replace(/ /g, ".")}@example.edu`,
    role: (i < 2 ? "admin" : i < 5 ? "instructor" : "student") as Role,
    createdAt: `2026-08-${String(i + 1).padStart(2, "0")}T08:00:00Z`,
  }));
  const titles = [
    "Software Engineering Foundations",
    "Data Structures & Algorithms",
    "Database Systems",
    "Computer Networks",
    "Human–Computer Interaction",
    "Applied Machine Learning",
    "Operating Systems",
    "Research Methods: Evidence, Reproducibility and Responsible Collaboration",
  ];
  const courses = titles.map((title, i) => ({
    id: `course-${i + 1}`,
    code: `CS${201 + i}`,
    title,
    description:
      i === 7
        ? "Build a reproducible research workflow, assess evidence, and communicate limitations. Includes a long-form collaborative discussion and critical review of published findings."
        : `Explore ${title.toLowerCase()} through guided lessons and practical exercises.`,
    instructorId: users[2 + (i % 3)].id,
    category: i === 7 ? "Research" : "Computer Science",
    level: (["Beginner", "Intermediate", "Advanced"] as const)[i % 3],
    isPublished: i < 6,
  }));
  const statuses = ["active", "completed", "cancelled", "suspended"] as const;
  const enrollments = Array.from({ length: 24 }, (_, i) => {
    const status = statuses[(i + Math.floor(i / 6)) % 4];
    const completedLessons = status === "completed" ? 8 : i % 6;
    return {
      id: `enrollment-${i + 1}`,
      courseId: courses[i % 6].id,
      studentId: users[5 + Math.floor(i / 6)].id,
      status,
      enrolledAt: `2026-${String(8 + Math.floor(i / 8)).padStart(2, "0")}-${String((i % 8) + 2).padStart(2, "0")}T08:00:00Z`,
      progress: {
        totalLessons: 8,
        completedLessons,
        percentage: Math.round((completedLessons / 8) * 100),
      },
    };
  });
  const reasons = [
    "Repeated promotional links unrelated to the lesson.",
    "Personal remarks directed at another learner.",
    "Potentially misleading technical advice without supporting evidence.",
  ];
  const reports: ContentReport[] = Array.from({ length: 9 }, (_, i) => ({
    id: `report-${i + 1}`,
    target: {
      id: `content-${i + 1}`,
      type: i % 2 ? "Comment" : "Discussion thread",
      title:
        i % 2
          ? "Reply to: Study group resources"
          : "Study group resources and course discussion",
      content:
        i % 3 === 0
          ? "Visit my external tutoring page for the answers to this week's exercises. This message has been posted in multiple lesson discussions."
          : i % 3 === 1
            ? "Your explanation is completely useless. Stop posting here; nobody wants to read your questions."
            : "I think this algorithm always runs in constant time, regardless of input size. Can someone verify the reasoning and share a reliable reference?",
      authorId: users[6 + (i % 7)].id,
      courseId: courses[i % 6].id,
    },
    reporterId: users[5 + (i % 9)].id,
    reason: reasons[i % 3],
    reportedAt: `2026-10-${String(10 + i).padStart(2, "0")}T10:00:00Z`,
    status: "Pending",
  }));
  const events = courses.map((course, i) => ({
    id: `seed-event-${i + 1}`,
    actor: { id: users[0].id, name: users[0].fullName },
    action: "Publication changed" as const,
    target: { id: course.id, name: course.title },
    timestamp: `2026-10-${String(9 - i).padStart(2, "0")}T09:00:00Z`,
    details: `Seeded demo event: publication changed from ${course.isPublished ? "Draft to Published" : "Published to Draft"}.`,
  }));
  const quizAttempts = enrollments
    .filter((e) => e.status === "completed" || e.status === "active")
    .map((e, i) => ({
      id: `attempt-${i + 1}`,
      courseId: e.courseId,
      studentId: e.studentId,
      score: [45, 68, 72, 85, 96, 80][i % 6],
      passScore: 70,
    }));
  return {
    users,
    courses,
    enrollments,
    reports,
    events,
    quizAttempts,
    sequence: 0,
  };
}
