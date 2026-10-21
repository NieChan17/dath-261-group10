-- Migration: V009__course_metadata_and_seeds.sql
-- Description: Add metadata fields to courses and lessons, seed initial roles and test accounts

-- 1. Add metadata fields to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced'));

-- 2. Add duration_minutes to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0 CHECK (duration_minutes >= 0);

-- 3. Indexes for new searchable/filterable columns
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);

-- 4. Seed initial roles
INSERT INTO roles (id, name, permissions)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin', '{"can_manage_users": true, "can_manage_courses": true, "can_view_audit": true}'::jsonb),
    ('00000000-0000-0000-0000-000000000002', 'instructor', '{"can_create_courses": true, "can_grade": true, "can_upload_materials": true}'::jsonb),
    ('00000000-0000-0000-0000-000000000003', 'student', '{"can_enroll": true, "can_submit_quizzes": true, "can_discuss": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 5. Seed default test accounts (passwords: Admin@123456, Instructor@123456, Student@123456)
-- Bcrypt hash generated for 'Admin@123456', 'Instructor@123456', 'Student@123456'
-- Test accounts share the initial password 'Admin@123456' / 'Instructor@123456' / 'Student@123456'
INSERT INTO users (id, role_id, email, password_hash, full_name, avatar_url)
VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin@edupulse.hcmut.edu.vn', '$2a$10$axXebPS4l6D1v8go06855O6Rsthd/tZyQ/KkHziwrhlxznzUOxO4y', 'System Administrator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'),
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'instructor@edupulse.hcmut.edu.vn', '$2a$10$axXebPS4l6D1v8go06855O6Rsthd/tZyQ/KkHziwrhlxznzUOxO4y', 'Dr. Nguyen Van A (HCMUT CSE)', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Instructor'),
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'student@edupulse.hcmut.edu.vn', '$2a$10$axXebPS4l6D1v8go06855O6Rsthd/tZyQ/KkHziwrhlxznzUOxO4y', 'Tran Van Hoc Vien', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student')
ON CONFLICT (email) DO NOTHING;

-- 6. Seed sample course: CO3103 - Integrated Software Engineering Capstone
INSERT INTO courses (id, instructor_id, code, title, description, thumbnail_url, category, level, is_published)
VALUES (
    'c0310300-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'CO3103',
    'Integrated Software Engineering Capstone Project',
    'Chương trình đồ án tổng hợp Kỹ thuật phần mềm (HK261) - ĐH Bách Khoa TP.HCM. Phát triển nền tảng học trực tuyến EduPulse tích hợp trợ lý AI RAG grounded.',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    'Software Engineering',
    'Advanced',
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- 7. Seed sample sections for CO3103
INSERT INTO sections (id, course_id, title, order_index)
VALUES 
    ('c0310301-0000-0000-0000-000000000001', 'c0310300-0000-0000-0000-000000000001', 'Chương 1: Tổng quan & Khởi tạo dự án', 1),
    ('c0310301-0000-0000-0000-000000000002', 'c0310300-0000-0000-0000-000000000001', 'Chương 2: Thiết kế Kiến trúc & Cơ sở dữ liệu', 2),
    ('c0310301-0000-0000-0000-000000000003', 'c0310300-0000-0000-0000-000000000001', 'Chương 3: Phát triển Core Modules & Tích hợp RAG', 3)
ON CONFLICT DO NOTHING;

-- 8. Seed sample lessons for Section 1 & 2
INSERT INTO lessons (id, section_id, title, content_type, duration_minutes, order_index)
VALUES
    ('c0310302-0000-0000-0000-000000000001', 'c0310301-0000-0000-0000-000000000001', 'Bài 1.1: Giới thiệu đề tài & Phân bổ WBS', 'video', 30, 1),
    ('c0310302-0000-0000-0000-000000000002', 'c0310301-0000-0000-0000-000000000001', 'Bài 1.2: Thiết lập Monorepo & Quy chuẩn kỹ thuật', 'text', 20, 2),
    ('c0310302-0000-0000-0000-000000000003', 'c0310301-0000-0000-0000-000000000002', 'Bài 2.1: Thiết kế ERD & Chuẩn hóa dữ liệu PostgreSQL', 'slides', 45, 1),
    ('c0310302-0000-0000-0000-000000000004', 'c0310301-0000-0000-0000-000000000002', 'Bài 2.2: Trắc nghiệm kiến trúc RBAC & Token Auth', 'quiz', 15, 2)
ON CONFLICT DO NOTHING;

-- 9. Seed sample quiz for Lesson 2.2
INSERT INTO quizzes (id, lesson_id, title, pass_score, time_limit_minutes)
VALUES (
    'c0310303-0000-0000-0000-000000000001',
    'c0310302-0000-0000-0000-000000000004',
    'Quiz: Kiến thức về RBAC và Bảo mật Token',
    80.00,
    15
) ON CONFLICT DO NOTHING;

-- 10. Seed sample questions for Quiz
INSERT INTO questions (id, quiz_id, prompt, question_type, points, options, correct_answer, order_index)
VALUES 
    (
        'c0310304-0000-0000-0000-000000000001',
        'c0310303-0000-0000-0000-000000000001',
        'Cờ bảo mật nào trong Cookie ngăn chặn truy cập token từ mã JavaScript nhằm chống XSS?',
        'multiple_choice',
        5.00,
        '["HttpOnly", "Secure", "SameSite", "Domain"]'::jsonb,
        'HttpOnly',
        1
    ),
    (
        'c0310304-0000-0000-0000-000000000002',
        'c0310303-0000-0000-0000-000000000001',
        'Thuật toán băm mật khẩu nào đoạt giải Password Hashing Competition và được OWASP khuyến nghị hàng đầu?',
        'multiple_choice',
        5.00,
        '["MD5", "SHA-256", "Argon2", "DES"]'::jsonb,
        'Argon2',
        2
    )
ON CONFLICT DO NOTHING;
