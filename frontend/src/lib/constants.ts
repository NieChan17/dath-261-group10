export const APP_CONFIG = {
  name: "EduPulse",
  description: "Next-generation online learning platform for Computer Science & Engineering",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot",
  COURSES: "/courses",
  ASSIGNMENTS: "/assignments",
  LEARN: (courseId: string) => `/courses/${courseId}/learn`,
  ASSIGNMENT: (id: string) => `/assignments/${id}`,
  DISCUSSIONS: "/discussions",
  PROFILE: "/profile",
  ANALYTICS: "/analytics",
  PORTAL: "/portal",
  INSTRUCTOR: {
    OVERVIEW: "/instructor",
    COURSES: "/instructor/courses",
    CREATE_COURSE: "/instructor/courses/create",
    SUBMISSIONS: "/instructor/submissions",
  },
  ADMIN: {
    OVERVIEW: "/admin",
    REPORTS: "/admin/reports",
    USERS: "/admin/users",
    COURSES: "/admin/courses",
    LOGS: "/admin/logs",
  },
};
