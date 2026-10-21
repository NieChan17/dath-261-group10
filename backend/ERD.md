# EduPulse — Entity Relationship Diagram (ERD) Specification

Tài liệu thiết kế chi tiết cơ sở dữ liệu quan hệ cho nền tảng học trực tuyến **EduPulse** (Môn học CO3103 - HK261 - Group 10).

---

## 1. Biểu đồ quan hệ ERD (Mermaid)

```mermaid
erDiagram
    ROLES ||--o{ USERS : "has"
    USERS ||--o{ COURSES : "instructs"
    USERS ||--o{ ENROLLMENTS : "registers"
    USERS ||--o{ SUBMISSIONS : "submits"
    USERS ||--o{ DISCUSSION_THREADS : "authors"
    USERS ||--o{ COMMENTS : "writes"
    USERS ||--o{ QUERY_AUDIT_LOGS : "queries"

    COURSES ||--o{ SECTIONS : "contains"
    COURSES ||--o{ ENROLLMENTS : "has"

    SECTIONS ||--o{ LESSONS : "contains"

    LESSONS ||--o{ MATERIALS : "provides"
    LESSONS ||--o{ QUIZZES : "evaluates"
    LESSONS ||--o{ PROGRESS_RECORDS : "tracks"
    LESSONS ||--o{ DISCUSSION_THREADS : "hosts"

    ENROLLMENTS ||--o{ PROGRESS_RECORDS : "records"

    QUIZZES ||--o{ QUESTIONS : "contains"
    QUIZZES ||--o{ SUBMISSIONS : "receives"

    MATERIALS ||--o{ MATERIAL_EMBEDDINGS : "vectorized_as"
    COMMENTS ||--o{ COMMENTS : "nested_under"

    ROLES {
        uuid id PK
        varchar(50) name UK
        jsonb permissions
        timestamptz created_at
    }

    USERS {
        uuid id PK
        uuid role_id FK
        varchar(255) email UK
        varchar(255) password_hash
        varchar(255) full_name
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }

    COURSES {
        uuid id PK
        uuid instructor_id FK
        varchar(50) code UK
        varchar(255) title
        text description
        text thumbnail_url
        varchar(100) category
        varchar(50) level
        boolean is_published
        timestamptz created_at
        timestamptz updated_at
    }

    SECTIONS {
        uuid id PK
        uuid course_id FK
        varchar(255) title
        integer order_index
        timestamptz created_at
    }

    LESSONS {
        uuid id PK
        uuid section_id FK
        varchar(255) title
        varchar(50) content_type
        integer duration_minutes
        integer order_index
        timestamptz created_at
    }

    MATERIALS {
        uuid id PK
        uuid lesson_id FK
        varchar(50) type
        text file_url
        text transcript
        integer duration_seconds
        timestamptz created_at
    }

    QUIZZES {
        uuid id PK
        uuid lesson_id FK
        varchar(255) title
        numeric(5,2) pass_score
        integer time_limit_minutes
        timestamptz created_at
    }

    QUESTIONS {
        uuid id PK
        uuid quiz_id FK
        text prompt
        varchar(50) question_type
        numeric(8,2) points
        jsonb options
        text correct_answer
        integer order_index
    }

    SUBMISSIONS {
        uuid id PK
        uuid quiz_id FK
        uuid student_id FK
        numeric(8,2) score
        varchar(30) status
        jsonb answers
        timestamptz submitted_at
    }

    ENROLLMENTS {
        uuid id PK
        uuid student_id FK
        uuid course_id FK
        varchar(30) status
        timestamptz enrolled_at
    }

    PROGRESS_RECORDS {
        uuid id PK
        uuid enrollment_id FK
        uuid lesson_id FK
        boolean is_completed
        integer last_position_seconds
        timestamptz updated_at
    }

    MATERIAL_EMBEDDINGS {
        uuid id PK
        uuid material_id FK
        text chunk_content
        vector embedding
        jsonb metadata_json
        timestamptz created_at
    }

    DISCUSSION_THREADS {
        uuid id PK
        uuid lesson_id FK
        uuid author_id FK
        varchar(255) title
        text content
        timestamptz created_at
    }

    COMMENTS {
        uuid id PK
        uuid thread_id FK
        uuid author_id FK
        uuid parent_id FK
        text content
        timestamptz created_at
    }

    QUERY_AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        text query_text
        text response_text
        numeric(6,5) similarity_score
        integer feedback_rating
        jsonb source_citations
        timestamptz created_at
    }
```

---

## 2. Đặc tả Chi tiết 15 Thực thể Dữ liệu

### 2.1. Nhóm Xác thực & Người dùng (Identity & Access)
| Thực thể | Thuộc tính chính | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| **`roles`** | `id`, `name`, `permissions`, `created_at` | `name` là UNIQUE (`admin`, `instructor`, `student`). `permissions` dạng JSONB cho phép định nghĩa quyền mở rộng. |
| **`users`** | `id`, `role_id`, `email`, `password_hash`, `full_name`, `avatar_url`, `created_at`, `updated_at` | `email` UNIQUE. `password_hash` lưu mã băm Argon2 hoặc bcrypt. `role_id` tham chiếu `roles.id` ON DELETE RESTRICT. |

### 2.2. Nhóm Khóa học & Nội dung (Catalog & Content)
| Thực thể | Thuộc tính chính | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| **`courses`** | `id`, `instructor_id`, `code`, `title`, `description`, `thumbnail_url`, `category`, `level`, `is_published`, `created_at`, `updated_at` | `code` UNIQUE (VD: `CO3103`). `instructor_id` FK tới `users.id`. `level` ∈ ('Beginner', 'Intermediate', 'Advanced'). |
| **`sections`** | `id`, `course_id`, `title`, `order_index`, `created_at` | FK tới `courses.id` ON DELETE CASCADE. UNIQUE(`course_id`, `order_index`). |
| **`lessons`** | `id`, `section_id`, `title`, `content_type`, `duration_minutes`, `order_index`, `created_at` | FK tới `sections.id` ON DELETE CASCADE. `content_type` ∈ ('video', 'slides', 'text', 'quiz', 'assignment'). UNIQUE(`section_id`, `order_index`). |
| **`materials`** | `id`, `lesson_id`, `type`, `file_url`, `transcript`, `duration_seconds`, `created_at` | FK tới `lessons.id` ON DELETE CASCADE. CHECK (`file_url IS NOT NULL OR transcript IS NOT NULL`). |

### 2.3. Nhóm Đánh giá & Kiểm tra (Assessment Engine)
| Thực thể | Thuộc tính chính | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| **`quizzes`** | `id`, `lesson_id`, `title`, `pass_score`, `time_limit_minutes`, `created_at` | FK tới `lessons.id` ON DELETE CASCADE. `pass_score` từ 0..100. |
| **`questions`** | `id`, `quiz_id`, `prompt`, `question_type`, `points`, `options`, `correct_answer`, `order_index` | FK tới `quizzes.id` ON DELETE CASCADE. `options` dạng mảng JSONB các lựa chọn. UNIQUE(`quiz_id`, `order_index`). |
| **`submissions`** | `id`, `quiz_id`, `student_id`, `score`, `status`, `answers`, `submitted_at` | `status` ∈ ('draft', 'submitted', 'graded', 'returned'). `answers` dạng JSONB lưu câu trả lời. |

### 2.4. Nhóm Đăng ký & Tiến độ học tập (Enrollment & Progress)
| Thực thể | Thuộc tính chính | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| **`enrollments`** | `id`, `student_id`, `course_id`, `status`, `enrolled_at` | UNIQUE(`student_id`, `course_id`). `status` ∈ ('active', 'completed', 'cancelled', 'suspended'). |
| **`progress_records`** | `id`, `enrollment_id`, `lesson_id`, `is_completed`, `last_position_seconds`, `updated_at` | UNIQUE(`enrollment_id`, `lesson_id`). Phục vụ tính năng Resume playback và tỷ lệ hoàn thành. |

### 2.5. Nhóm AI & Kiểm toán (RAG AI & Audit)
| Thực thể | Thuộc tính chính | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| **`material_embeddings`** | `id`, `material_id`, `chunk_content`, `embedding`, `metadata_json`, `created_at` | Cột `embedding` dùng kiểu dữ liệu `vector` (pgvector). GIN index trên `metadata_json`. |
| **`query_audit_logs`** | `id`, `user_id`, `query_text`, `response_text`, `similarity_score`, `feedback_rating`, `source_citations`, `created_at` | FK tới `users.id` ON DELETE SET NULL. `feedback_rating` ∈ [1, 5] phục vụ đánh giá chất lượng RAGAS. |

### 2.6. Nhóm Tương tác & Thảo luận (Discussion & Community)
| Thực thể | Thuộc tính chính | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| **`discussion_threads`** | `id`, `lesson_id`, `author_id`, `title`, `content`, `created_at` | Thảo luận gắn liền ngữ cảnh bài học. FK tới `lessons.id` và `users.id`. |
| **`comments`** | `id`, `thread_id`, `author_id`, `parent_id`, `content`, `created_at` | Bình luận dạng cây (hỗ trợ nested comments với `parent_id` tự tham chiếu ON DELETE CASCADE). |

---

## 3. Danh sách File Migration SQL
- `V001__extensions_and_roles_users.sql`: Cấu hình pgcrypto, vector, bảng `roles`, `users`.
- `V002__courses_sections_lessons.sql`: Bảng `courses`, `sections`, `lessons`.
- `V003__enrollments_progress.sql`: Bảng `enrollments`, `progress_records`.
- `V004__quizzes_questions_submissions.sql`: Bảng `quizzes`, `questions`, `submissions`.
- `V005__materials_embeddings.sql`: Bảng `materials`, `material_embeddings`.
- `V006__discussions_comments.sql`: Bảng `discussion_threads`, `comments`.
- `V007__query_audit_logs.sql`: Bảng `query_audit_logs`.
- `V008__updated_at_triggers.sql`: Triggers tự động cập nhật `updated_at`.
- `V009__course_metadata_and_seeds.sql`: Bổ sung metadata và seed dữ liệu khởi tạo.
