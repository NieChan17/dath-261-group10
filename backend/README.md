# EduPulse Backend — NestJS Modular Monolith API

Dự án Backend cho Nền tảng học trực tuyến **EduPulse** — Môn học **CO3103 (Software Engineering Integration Project - HK261) - Group 10**.

---

## 📌 1. Tổng quan Kiến trúc

- **Framework:** NestJS 10 (TypeScript) theo kiến trúc Modular Monolith.
- **Database:** PostgreSQL 16 kết hợp extension `pgcrypto` và `pgvector`.
- **Bảo mật:** Băm mật khẩu bằng **Argon2** (kèm hỗ trợ bcrypt), xác thực **JWT** lưu trong **HttpOnly cookie** và phân quyền RBAC 3 vai trò (`student`, `instructor`, `admin`).
- **Tài liệu API:** Tích hợp sẵn **Swagger OpenAPI** tại `/api/docs`.
- **Tương thích:** Đồng bộ chuẩn dữ liệu với Frontend Next.js 14 và AI Service (FastAPI RAG).

---

## 🗄️ 2. Thiết kế Cơ sở Dữ liệu & Migrations

Biểu đồ ERD chi tiết và đặc tả 15 thực thể được lưu tại tài liệu: [**ERD.md**](./ERD.md).

### Danh sách các thực thể:
1. `roles` — Quản lý vai trò và phân quyền chi tiết.
2. `users` — Người dùng, mật khẩu băm Argon2/bcrypt, liên kết role.
3. `courses` — Khóa học, mã môn học, giảng viên phụ trách, ảnh thumbnail, danh mục, cấp độ.
4. `sections` — Chương mục trong khóa học (có thứ tự hiển thị `order_index`).
5. `lessons` — Bài học trong từng chương (loại nội dung `content_type`, thời lượng `duration_minutes`).
6. `materials` — Học liệu đính kèm (Video URL, Slide PDF, văn bản, transcript).
7. `quizzes` — Đề kiểm tra trắc nghiệm gắn với bài học (`pass_score`, `time_limit_minutes`).
8. `questions` — Ngân hàng câu hỏi trắc nghiệm, các lựa chọn JSONB, đáp án đúng.
9. `submissions` — Bài nộp của sinh viên, câu trả lời JSONB và điểm số.
10. `enrollments` — Đăng ký khóa học của sinh viên (`status`: active, completed, cancelled).
11. `progress_records` — Tiến độ học tập từng bài học, lưu vị trí video để tiếp tục học (`last_position_seconds`).
12. `material_embeddings` — Vector embeddings phục vụ tìm kiếm ngữ nghĩa RAG (pgvector).
13. `discussion_threads` — Chủ đề hỏi đáp gắn theo từng bài học.
14. `comments` — Bình luận thảo luận hỗ trợ trả lời lồng nhau (`parent_id`).
15. `query_audit_logs` — Nhật ký tương tác trợ lý ảo AI để kiểm duyệt và đánh giá độ chính xác (RAGAS).

### Chạy Migrations & Seed Dữ liệu

Migration Runner tự động áp dụng tuần tự các file migration từ `V001` đến `V009`:

```bash
# Thiết lập chuỗi kết nối database trong file .env hoặc command line:
npm run db:migrate
```

#### Dữ liệu mẫu khởi tạo sẵn (Seeded Accounts):
| Vai trò | Email đăng nhập | Mật khẩu mặc định |
| :--- | :--- | :--- |
| **Admin** | `admin@edupulse.hcmut.edu.vn` | `Admin@123456` |
| **Instructor** | `instructor@edupulse.hcmut.edu.vn` | `Instructor@123456` |
| **Student** | `student@edupulse.hcmut.edu.vn` | `Student@123456` |

*Khóa học mẫu:* `CO3103` (Integrated Software Engineering Capstone Project) đã được seed sẵn 3 chương mục, 4 bài học và đề trắc nghiệm mẫu.

---

## 🔐 3. Authentication & Phân quyền (RBAC)

### Cơ chế Bảo mật:
- **Băm mật khẩu:** Sử dụng thuật toán **Argon2** (chuẩn khuyến nghị số 1 của OWASP) kết hợp lớp nhận diện tự động băm **bcrypt**.
- **HttpOnly Cookie:** Cặp `access_token` (1 giờ) và `refresh_token` (7 ngày) được gửi trong HttpOnly Cookie (`SameSite: Lax`, `Secure: true` trên production) nhằm ngăn chặn đánh cắp token qua tấn công XSS.
- **Dual Extraction:** Hệ thống tự động trích xuất JWT từ Cookie hoặc từ Header `Authorization: Bearer <token>` để thuận tiện cho việc phát triển và gọi API từ Postman/Swagger.
- **Phân quyền 3 vai trò:** Kiểm tra vai trò bằng decorator `@Roles('admin', 'instructor', 'student')` thông qua `RolesGuard`.

### Danh sách Endpoint Xác thực:
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Đăng ký tài khoản (hỗ trợ chọn `student` hoặc `instructor`) |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập, thiết lập HttpOnly cookie |
| `POST` | `/api/v1/auth/refresh` | Public | Cấp mới token thông qua refresh token cookie |
| `POST` | `/api/v1/auth/logout` | Public | Đăng xuất, xóa toàn bộ auth cookies |
| `GET` | `/api/v1/auth/me` | Authenticated | Lấy thông tin tài khoản đang đăng nhập |

---

## 📚 4. Course Catalog & Cấu trúc Syllabus API

### Danh mục Khóa học (Tìm kiếm, Lọc, Phân trang):
- **`GET /api/v1/courses`**
  - **Query parameters:**
    - `page`: Số trang (mặc định: `1`)
    - `limit`: Số mục trên mỗi trang (mặc định: `10`, tối đa `100`)
    - `search`: Từ khóa tìm kiếm không phân biệt hoa thường trong `title`, `description`, `code`
    - `category`: Lọc theo thể loại (`Software Engineering`, `Computer Science`...)
    - `level`: Lọc theo cấp độ (`Beginner`, `Intermediate`, `Advanced`)
    - `instructorId`: Lọc theo giảng viên phụ trách
    - `isPublished`: Lọc theo trạng thái xuất bản (với học viên/khách, hệ thống tự động lọc `isPublished = true`)
    - `sortBy`: Trường sắp xếp (`created_at`, `title`, `code`, `level`)
    - `sortOrder`: `ASC` hoặc `DESC` (mặc định: `DESC`)

### Cấu trúc Phân cấp Khóa học (Syllabus Tree):
- **`GET /api/v1/courses/:id`**: Trả về chi tiết khóa học và cây phân cấp trọn vẹn:
  - Khóa học $\rightarrow$ Danh sách Chương (`sections` / `chapters`)
  - Mỗi Chương $\rightarrow$ Danh sách Bài học (`lessons`) kèm loại nội dung (`video`, `slides`, `text`, `quiz`)
  - Mỗi Bài học $\rightarrow$ Thông tin tóm tắt học liệu (`materials`) hoặc bài thi trắc nghiệm (`quiz`).

### Quản lý Khóa học, Chương & Bài học:
| Method | Endpoint | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/courses` | Instructor, Admin | Tạo khóa học mới |
| `PUT` | `/api/v1/courses/:id` | Owner, Admin | Cập nhật thông tin khóa học |
| `DELETE` | `/api/v1/courses/:id` | Owner, Admin | Xóa khóa học |
| `PATCH` | `/api/v1/courses/:id/publish` | Owner, Admin | Chuyển đổi trạng thái xuất bản / nháp |
| `POST` | `/api/v1/courses/:courseId/sections` | Owner, Admin | Thêm chương mục mới |
| `PUT` | `/api/v1/sections/:id` | Owner, Admin | Đổi tên/cập nhật chương mục |
| `DELETE` | `/api/v1/sections/:id` | Owner, Admin | Xóa chương mục |
| `PATCH` | `/api/v1/courses/:courseId/sections/reorder` | Owner, Admin | Sắp xếp lại thứ tự các chương mục |
| `POST` | `/api/v1/sections/:sectionId/lessons` | Owner, Admin | Thêm bài học mới vào chương |
| `GET` | `/api/v1/lessons/:id` | Authenticated | Xem chi tiết bài học, tài liệu & đề thi |
| `PUT` | `/api/v1/lessons/:id` | Owner, Admin | Cập nhật bài học |
| `DELETE` | `/api/v1/lessons/:id` | Owner, Admin | Xóa bài học |

---

## 📝 5. Assessment Engine — Đánh giá & Kiểm tra (M4)

### 5.1. Bài trắc nghiệm tính giờ & Chấm tự động (Quizzes):
| Method | Endpoint | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/lessons/:lessonId/quizzes` | Instructor, Admin | Tạo bài trắc nghiệm kèm danh sách câu hỏi |
| `GET` | `/api/v1/quizzes/:id` | Authenticated | Chi tiết bài thi (ẩn đáp án đối với học viên) |
| `PUT` | `/api/v1/quizzes/:id` | Instructor, Admin | Cập nhật thời gian làm bài, điểm sàn, xáo đề |
| `DELETE` | `/api/v1/quizzes/:id` | Instructor, Admin | Xóa bài trắc nghiệm |
| `POST` | `/api/v1/quizzes/:id/questions` | Instructor, Admin | Thêm câu hỏi vào bài thi |
| `PUT` | `/api/v1/quizzes/questions/:questionId` | Instructor, Admin | Cập nhật nội dung/đáp án câu hỏi |
| `DELETE` | `/api/v1/quizzes/questions/:questionId` | Instructor, Admin | Xóa câu hỏi khỏi bài thi |
| `POST` | `/api/v1/quizzes/:id/start` | Student, Admin | Bắt đầu bài trắc nghiệm tính giờ (trả về thời gian đếm ngược, câu hỏi an toàn) |
| `POST` | `/api/v1/quizzes/:id/submit` | Student, Admin | Nộp bài và chấm tự động tức thì (tự động cập nhật `progress_records` khi đạt) |
| `GET` | `/api/v1/quizzes/:id/my-submissions` | Student, Admin | Xem lịch sử các lần làm bài trắc nghiệm |
| `GET` | `/api/v1/quizzes/submissions/:submissionId` | Owner, Instructor, Admin | Xem bảng điểm phân tích chi tiết của 1 bài nộp |
| `GET` | `/api/v1/quizzes/:id/analytics` | Instructor, Admin | Thống kê phổ điểm, tỷ lệ đỗ, điểm trung bình bài thi |

### 5.2. Bài tập nộp file kèm Rubric chấm điểm (Assignments):
| Method | Endpoint | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/lessons/:lessonId/assignments` | Instructor, Admin | Tạo bài tập nộp file kèm bộ tiêu chí rubric |
| `GET` | `/api/v1/assignments/:id` | Authenticated | Chi tiết bài tập, tiêu chí rubric và kết quả bài nộp cá nhân |
| `PUT` | `/api/v1/assignments/:id` | Instructor, Admin | Cập nhật hạn nộp, dung lượng, định dạng file cho phép |
| `DELETE` | `/api/v1/assignments/:id` | Instructor, Admin | Xóa bài tập nộp file |
| `POST` | `/api/v1/assignments/:id/rubrics` | Instructor, Admin | Thêm tiêu chí rubric mới |
| `PUT` | `/api/v1/assignments/rubrics/:rubricId` | Instructor, Admin | Cập nhật tiêu chí rubric và các mức đánh giá |
| `DELETE` | `/api/v1/assignments/rubrics/:rubricId` | Instructor, Admin | Xóa tiêu chí rubric |
| `POST` | `/api/v1/assignments/:id/submit` | Student, Admin | Nộp file bài tập (Multipart file upload hoặc fileUrl, kiểm tra hạn nộp) |
| `GET` | `/api/v1/assignments/:id/my-submission` | Student, Admin | Xem bài nộp của học viên, điểm số và nhận xét từng tiêu chí rubric |
| `GET` | `/api/v1/assignments/:id/submissions` | Instructor, Admin | Danh sách toàn bộ bài nộp của lớp, thống kê bài nộp trễ và điểm số |
| `POST` | `/api/v1/assignments/submissions/:submissionId/grade` | Instructor, Admin | Chấm điểm bài nộp theo từng tiêu chí trong bảng Rubric (tự động cập nhật tiến độ) |
| `GET` | `/api/v1/assignments/files/:filename` | Authenticated | Tải / xem file bài tập đã nộp an toàn |

---

## 🚀 6. Hướng dẫn Khởi chạy & Kiểm thử

### Cài đặt biến môi trường:
Tạo file `.env` tại thư mục `backend/`:
```env
PORT=5000
DATABASE_URL=postgresql://edupulse_user:secure_staging_password@localhost:5432/edupulse_staging
JWT_SECRET=super-secret-edupulse-jwt-key-2026-hk261
JWT_REFRESH_SECRET=super-secret-refresh-key-edupulse-2026
CORS_ORIGIN=http://localhost:3000
```

### Khởi chạy ứng dụng:
```bash
# Cài đặt thư viện
npm install

# Build dự án
npm run build

# Chạy ở chế độ phát triển
npm run start:dev

# Chạy bộ test tự động (67 tests qua 7 test suites)
npm test
```

### Xem Swagger API Documentation:
Mở trình duyệt truy cập:
👉 `http://localhost:5000/api/docs`

### Triển khai với Docker:
Backend đã có sẵn [Dockerfile](./Dockerfile) đa tầng (multi-stage build), sẵn sàng chạy cùng toàn bộ hệ sinh thái qua Docker Compose tại thư mục gốc:
```bash
docker compose up -d backend
```
