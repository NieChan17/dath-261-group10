CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    pass_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (pass_score >= 0 AND pass_score <= 100),
    time_limit_minutes INTEGER CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    points NUMERIC(8,2) NOT NULL DEFAULT 1 CHECK (points >= 0),
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT,
    order_index INTEGER NOT NULL DEFAULT 0 CHECK (order_index >= 0),
    CONSTRAINT uq_questions_quiz_order UNIQUE(quiz_id, order_index)
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    score NUMERIC(8,2) CHECK (score IS NULL OR score >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'submitted',
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_submissions_status CHECK (status IN ('draft', 'submitted', 'graded', 'returned'))
);

CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_submissions_quiz_id ON submissions(quiz_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
