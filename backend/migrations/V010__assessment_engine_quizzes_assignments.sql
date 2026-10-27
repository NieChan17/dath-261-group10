-- ==============================================================================
-- Migration V010: Assessment Engine — Timed Quizzes, Auto-Grading & File Assignments with Rubrics
-- ==============================================================================

-- 1. Enhance Quizzes table
ALTER TABLE quizzes
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Enhance Questions table
ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS explanation TEXT;

-- 3. Enhance Submissions table for timed quizzes and detailed tracking
ALTER TABLE submissions
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0;

-- Update submissions status constraint to support 'in_progress'
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_status;
ALTER TABLE submissions ADD CONSTRAINT chk_submissions_status 
    CHECK (status IN ('draft', 'in_progress', 'submitted', 'graded', 'returned'));

-- 4. Create Assignments table for file-based submissions
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    allowed_file_types JSONB NOT NULL DEFAULT '["pdf","zip","docx","rar","tar.gz","txt","js","ts","py"]'::jsonb,
    max_file_size_mb INTEGER NOT NULL DEFAULT 25 CHECK (max_file_size_mb > 0),
    due_date TIMESTAMPTZ,
    total_points NUMERIC(8,2) NOT NULL DEFAULT 100 CHECK (total_points > 0),
    pass_score NUMERIC(5,2) NOT NULL DEFAULT 50 CHECK (pass_score >= 0 AND pass_score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Rubric Criteria table
CREATE TABLE IF NOT EXISTS assignment_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    criterion_name VARCHAR(255) NOT NULL,
    description TEXT,
    max_points NUMERIC(6,2) NOT NULL CHECK (max_points > 0),
    order_index INTEGER NOT NULL DEFAULT 0,
    levels JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create Assignment Submissions table (File uploads)
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_url TEXT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100),
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned', 'resubmitted')),
    total_score NUMERIC(8,2) CHECK (total_score IS NULL OR total_score >= 0),
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    feedback TEXT,
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_assignment UNIQUE(student_id, assignment_id)
);

-- 7. Create Rubric Evaluations table (Detailed scores per rubric criterion)
CREATE TABLE IF NOT EXISTS rubric_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    rubric_id UUID NOT NULL REFERENCES assignment_rubrics(id) ON DELETE CASCADE,
    points_awarded NUMERIC(6,2) NOT NULL CHECK (points_awarded >= 0),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_submission_rubric UNIQUE(submission_id, rubric_id)
);

-- 8. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz_student ON submissions(quiz_id, student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

CREATE INDEX IF NOT EXISTS idx_assignments_lesson_id ON assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignment_rubrics_assignment_id ON assignment_rubrics(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_rubric_evaluations_submission_id ON rubric_evaluations(submission_id);

-- 9. Sample Seed Data for Assignment with Rubric (for Lesson 1.2 Monorepo Setup)
INSERT INTO assignments (id, lesson_id, title, description, allowed_file_types, max_file_size_mb, due_date, total_points, pass_score)
VALUES (
    'c0310305-0000-0000-0000-000000000001',
    'c0310302-0000-0000-0000-000000000002',
    'Bài tập lớn 1: Thiết lập Monorepo & Cấu hình CI/CD Pipeline',
    'Sinh viên đóng gói mã nguồn hoặc tài liệu cấu hình monorepo, docker-compose và pipeline GitHub Actions dạng file ZIP hoặc PDF.',
    '["zip","pdf","tar.gz"]'::jsonb,
    25,
    NOW() + INTERVAL '14 days',
    100.00,
    60.00
) ON CONFLICT DO NOTHING;

-- Seed Rubric Criteria for Assignment 1
INSERT INTO assignment_rubrics (id, assignment_id, criterion_name, description, max_points, order_index, levels)
VALUES
    (
        'c0310306-0000-0000-0000-000000000001',
        'c0310305-0000-0000-0000-000000000001',
        'Cấu trúc Monorepo & Quy chuẩn Clean Architecture',
        'Thư mục rõ ràng, phân tách frontend/backend, cấu hình tsconfig và scripts hợp lý.',
        30.00,
        1,
        '[
            {"label": "Xuất sắc", "points": 30, "description": "Cấu trúc chuẩn NestJS + Next.js, scripts build chạy mượt"},
            {"label": "Khá", "points": 22, "description": "Cấu trúc tốt nhưng còn một số script chưa tối ưu"},
            {"label": "Trung bình", "points": 15, "description": "Chưa tách biệt rõ ràng các module"}
        ]'::jsonb
    ),
    (
        'c0310306-0000-0000-0000-000000000002',
        'c0310305-0000-0000-0000-000000000001',
        'Containerization & Docker Compose',
        'Khởi chạy thành công backend, frontend, PostgreSQL và Nginx qua docker-compose up.',
        40.00,
        2,
        '[
            {"label": "Hoàn hảo", "points": 40, "description": "Tất cả service khởi động đồng bộ, có healthcheck"},
            {"label": "Tốt", "points": 30, "description": "Chạy được nhưng thiếu cấu hình volume hoặc network"},
            {"label": "Chưa đạt", "points": 15, "description": "Lỗi crash khi build container"}
        ]'::jsonb
    ),
    (
        'c0310306-0000-0000-0000-000000000003',
        'c0310305-0000-0000-0000-000000000001',
        'Tài liệu Báo cáo & Video Demo',
        'File PDF báo cáo giải thích kiến trúc, đính kèm đường link video demo và kết quả kiểm thử.',
        30.00,
        3,
        '[
            {"label": "Đầy đủ", "points": 30, "description": "Báo cáo mạch lạc, hình ảnh trực quan, video demo rõ nét"},
            {"label": "Khá", "points": 20, "description": "Báo cáo đủ ý nhưng video demo sơ sài"},
            {"label": "Thiếu sót", "points": 10, "description": "Báo cáo sơ sài, thiếu kết quả test"}
        ]'::jsonb
    )
ON CONFLICT DO NOTHING;
