export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex?: number;
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  timeLimitMinutes: number;
  deadline?: string;
  questions: Question[];
}

export interface CodeSubmission {
  assignmentId: string;
  language: string;
  code: string;
  testResults?: {
    passed: boolean;
    output: string;
    runtimeMs: number;
  };
}
