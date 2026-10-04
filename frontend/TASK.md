# CO3103 — Frontend Development Work Breakdown & Collaborator Guide

Tài liệu này định nghĩa chi tiết phân công công việc (Work Breakdown Structure - WBS), quy chuẩn kỹ thuật và hướng dẫn triển khai các module Frontend của dự án **EduPulse — Nền tảng học trực tuyến (CO3103 - HK261)**.

---

## 👥 1. Bảng phân công trách nhiệm (Member Responsibilities)

| Thành viên | MSSV | Vai trò | Phạm vi phụ trách (WBS Deliverables) | Trạng thái |
| :--- | :---: | :---: | :--- | :---: |
| **Lâm Chí Nguyên** | `2412332` | **Frontend Lead** | - Kiến trúc Core Next.js 14, Design System & Tokens ([DESIGN.md])<br>- **Learner Portal:** Trang chủ (`/`), Catalog (`/courses`), Chi tiết khóa học (`/courses/[id]`)<br>- **Course Player & Workstation:** Video Canvas, Slide 12 Telemetry (`/my-learning`)<br>- **Advanced Module (Track 1):** RAG AI Grounded Tutor UI & Citation System<br>- **Auth & Profile:** Login (`/login`), Register (`/register`), Forgot (`/forgot`), Profile (`/profile`)<br>- **Interactions & Forum:** Diễn đàn thảo luận (`/discussions`) & Cơ chế Report vi phạm<br>- **Learner Assessment:** Màn hình làm bài thi/code sandbox (`/assignments/[id]`) | 🟢 Đang hoàn thiện |
| **Bùi Quang Đức** | `2410796` | **Frontend Dev** | - **Module 1: Instructor Course Builder** (Tạo/quản lý khóa học, chương/bài, upload học liệu)<br>- **Module 2: Quiz Authoring & Grading Studio** (Trình soạn đề trắc nghiệm, cấu hình đáp án tự động, giảng viên chấm bài & feedback)<br>- **Module 3: Admin Dashboard (M6)** (Quản trị tài khoản RBAC, danh mục khóa học, Audit logs & Thống kê số liệu) | 🟡 **Cần thực hiện** |

---

## 🛠️ 2. Hướng dẫn chi tiết các Task cho Cộng tác viên (Bùi Quang Đức)

### Task 1: Instructor Course Builder (Quản lý & Soạn thảo khóa học)
- **Mục tiêu:** Cho phép giảng viên tạo khóa học mới, chia chương/bài học, upload tài liệu học tập (video, slide, văn bản) và cấu hình xuất bản/ẩn khóa học (Mục 4.2 đề bài).
- **Các file cần tạo/triển khai:**
  - `src/app/instructor/courses/page.tsx` — Danh sách khóa học do giảng viên phụ trách (kèm nút tạo mới, trạng thái Draft/Published, số học viên).
  - `src/app/instructor/courses/create/page.tsx` (hoặc `[id]/edit/page.tsx`) — Trình tạo/sửa thông tin khóa học (Tiêu đề, mô tả, thumbnail, danh mục, cấp độ).
  - `src/components/instructor/curriculum-builder.tsx` — Component kéo-thả hoặc danh sách dạng cây để thêm Chương (Chapter) và Bài học (Lesson).
  - `src/components/instructor/material-uploader.tsx` — Form đính kèm học liệu đa định dạng (Link video, tệp PDF/Slide đính kèm).
- **Interface tham khảo:** [`src/types/course.ts`](`Course`, `Chapter`, `Lesson`, `MaterialType`).

---

### Task 2: Quiz Authoring & Grading Studio (Soạn đề thi & Chấm bài)
- **Mục tiêu:** Giảng viên thiết kế bộ câu hỏi trắc nghiệm, bài tập tự luận nộp tệp, cấu hình thời gian làm bài, điểm số và chấm bài/nhận xét bài làm của học viên (Mục 4.4 đề bài).
- **Các file cần tạo/triển khai:**
  - `src/app/instructor/quizzes/create/page.tsx` — Trình soạn đề trắc nghiệm (Soạn câu hỏi, các phương án A/B/C/D, tích chọn đáp án đúng, điểm số và giải thích).
  - `src/components/quiz/question-builder.tsx` — Card soạn từng câu hỏi riêng biệt.
  - `src/app/instructor/submissions/page.tsx` — Danh sách bài nộp của học viên cần chấm.
  - `src/app/instructor/submissions/[id]/grade/page.tsx` — Màn hình xem bài làm (file đính kèm/code), chấm điểm và gửi feedback nhận xét cho học viên.
- **Interface tham khảo:** [`src/types/quiz.ts`](`Quiz`, `Question`, `CodeSubmission`).

---

### Task 3: Admin Dashboard (M6) (Bảng điều khiển Quản trị hệ thống)
- **Mục tiêu:** Bảng điều khiển quản trị tập trung hệ thống cho Quản trị viên (Admin) theo Mục 4.6 đề bài.
- **Các file cần tạo/triển khai:**
  - `src/app/admin/page.tsx` — Dashboard tổng quan hiển thị các metric cards: Tổng số user, Tổng số khóa học, Tỷ lệ hoàn thành, Biểu đồ tăng trưởng.
  - `src/app/admin/users/page.tsx` — Bảng quản lý người dùng (Danh sách, phân quyền `student` / `instructor` / `admin`, khóa/mở tài khoản).
  - `src/app/admin/courses/page.tsx` — Kiểm duyệt và quản lý toàn bộ khóa học trên hệ thống.
  - `src/app/admin/logs/page.tsx` — Bảng xem nhật ký thao tác quan trọng của hệ thống (Audit Logs: ai đã tạo khóa học, xóa user, thay đổi quyền).
- **Interface tham khảo:** [`src/types/auth.ts`](`User`, `Role`).

---

## 📐 3. Quy chuẩn kỹ thuật bắt buộc tuân thủ (Coding Standards)

Để đảm bảo toàn bộ mã nguồn đồng nhất và chuyên nghiệp, bạn Đức **bắt buộc tuân thủ 4 nguyên tắc sau**:

### 3.1. Hệ thống Màu sắc & Design Tokens ([DESIGN.md])
- **Primary Color:** Xanh Royal Blue (`#004ac6` / `#2563eb`) cho các nút hành động chính, active tab, icon nổi bật.
- **Secondary Color:** Xanh ngọc Teal (`#006a61` / `#0d9488`) cho các badge xác thực, telemetry, verified state.
- **Backgrounds:** Nền trang `#f8f9ff` hoặc `#f8fafc`, nền Card/Panel là `#ffffff`.
- **Border Radius chuẩn:** Tất cả Card, Form Container, Modal đều dùng bo góc canonical **`15px`** (`rounded-2xl` hoặc `rounded-[15px]`).
- **Typography:**
  - Tiêu đề dùng font `font-display` (*Plus Jakarta Sans*).
  - Văn bản thường dùng `font-sans` (*Inter*).
  - Mã code/ID dùng `font-mono` (*JetBrains Mono*).

### 3.2. Tái sử dụng UI Component có sẵn (Shadcn/UI)
Tuyệt đối kiểm tra và tái sử dụng các component đã có sẵn trong thư mục `src/components/ui/` trước khi tạo mới:
- [`Button`](variants: `default`, `secondary`, `outline`, `ghost`, `destructive`)
- [`Card`, `CardHeader`, `CardTitle`, `CardContent`]
- [`Input`]
- [`Badge`](variants: `default`, `secondary`, `outline`, `destructive`)

### 3.3. Quy ước đặt tên Class Name (BEM-inspired Functional Naming)
Tất cả các class name tùy chỉnh phải tuân thủ cú pháp:
$$\text{\{Block\}\_\_\{Element\}\_\{Index\}}$$
*Ví dụ:*
```tsx
<div className="course-builder__container_01 p-6 rounded-[15px] bg-white border border-[#e2e8f0]">
  <h2 className="course-builder__title_01 font-display font-bold text-xl text-[#0b1c30]">
    Tạo khóa học mới
  </h2>
  <button className="course-builder__submit-btn_01 bg-[#2563eb] text-white px-4 py-2 rounded-lg">
    Lưu khóa học
  </button>
</div>
```

### 3.4. Debug & Data Attributes
Luôn thêm thuộc tính `data-component="TênComponent"` vào thẻ ngoài cùng của mỗi component để dễ dàng debug trên DevTools:
```tsx
<div data-component="CurriculumBuilder" className="...">
```

---

## 🚀 4. Quy trình kiểm tra & Nộp mã nguồn (Git Workflow)

Trước khi gửi Pull Request hoặc commit code lên nhánh chung, cần thực hiện các bước kiểm tra sau:

1. **Kiểm tra TypeScript (0 Errors):**
   ```powershell
   cd frontend
   npx tsc --noEmit
   ```
2. **Kiểm tra Production Build của Next.js:**
   ```powershell
   npm run build
   ```
3. **Commit & Push:**
   - Đặt commit message rõ ràng (ví dụ: `feat(instructor): add course builder and curriculum editor`).
   - Tạo Pull Request để Lead review trước khi merge vào nhánh `main`.
