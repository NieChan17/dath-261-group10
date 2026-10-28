export interface Citation {
  id: string;
  sourceTitle: string;
  lessonId?: string;
  pageNumber?: number;
  timestampSeconds?: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export interface GroundedQuery {
  courseId: string;
  currentLessonId?: string;
  prompt: string;
}
