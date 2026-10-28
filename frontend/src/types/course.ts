export type MaterialType = "video" | "text" | "slide" | "file";

export interface Lesson {
  id: string;
  title: string;
  order: number;
  type: MaterialType;
  contentUrl?: string;
  durationMinutes?: number;
  isCompleted?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorId: string;
  instructorName: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  enrollmentCount: number;
  rating: number;
  chapters: Chapter[];
  isPublished: boolean;
}
