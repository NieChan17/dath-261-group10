#!/bin/bash
set -e

# ==============================================================================
# 1. CẤU HÌNH THÔNG TIN DỰ ÁN
# ==============================================================================
REPO="NieChan17/dath-261-group10"
PROJECT_URL="https://github.com/users/NieChan17/projects/1"

# TÊN ĐĂNG NHẬP GITHUB CỦA 7 THÀNH VIÊN
USER_NGUYEN="NieChan17"       # Leader & Frontend (Lâm Chí Nguyên)
USER_MINH="MinhGiaVoNgo"     # Backend (Ngô Võ Gia Minh)
USER_DUC="ducbui2007-ops"     # Frontend (Bùi Quang Đức)
USER_PHAT="phatmmp"          # Backend (Nguyễn Huỳnh Tấn Phát)
USER_NHA="dinhnha1402hcmut"   # Infra-AI (Nguyễn Đình Nhã)
USER_TAM="TamNguyen1010"     # Infra-QA (Nguyễn Hoàng Phúc Tâm)
USER_NHAN="ThienNhan0906"    # Infra-SEC (Nguyễn Hồng Thiện Nhân)

echo "==> 1. Đang khởi tạo các Labels chuẩn..."
declare -A LABELS=(
  ["frontend"]="1d76db"
  ["backend"]="0e8a16"
  ["infra"]="d93f0b"
  ["ai-rag"]="5319e7"
  ["testing"]="b60205"
  ["security"]="e99695"
  ["devops"]="fbca04"
  ["documentation"]="0075ca"
  ["management"]="c2e0c6"
)

for label in "${!LABELS[@]}"; do
  gh label create "$label" --repo "$REPO" --color "${LABELS[$label]}" --force || true
done

echo "==> 2. Đang khởi tạo Milestones theo tuần đồ án..."
WEEKS=("Week 38" "Week 39" "Week 40" "Week 41" "Week 42" "Week 43" "Week 44" "Week 45" "Week 46" "Week 47" "Week 48" "Week 49" "Week 50")
for week in "${WEEKS[@]}"; do
  gh api "repos/$REPO/milestones" -f title="$week" --silent || true
done

echo "==> 3. Đang tạo 24 Issues và đẩy vào Backlog của GitHub Project..."

create_task() {
  local title="$1"
  local milestone="$2"
  local labels="$3"
  local assignee="$4"
  local body="$5"

  echo "-> Đang tạo task: $title ($milestone)..."
  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    --milestone "$milestone" \
    --label "$labels" \
    --assignee "$assignee" \
    --project "$PROJECT_URL"
}

# --- GIAI ĐOẠN 1: KHỞI TẠO & THIẾT KẾ NỀN TẢNG (W38 - W40) ---
create_task "Finalize Project Proposal & Team Charter" "Week 38" "documentation,management" "$USER_NGUYEN" \
"Hoàn thiện tài liệu Proposal tối đa 4 trang theo chuẩn Section 8.2 và nộp đúng hạn 23:59 CN 20/09/2026."

create_task "Repository Scaffolding, Branch Rules & Initial CI" "Week 38" "devops,infra" "$USER_NHAN" \
"Cấu hình repo Monorepo, thiết lập .gitignore, branch protection trên nhánh main và GitHub Actions CI linting."

create_task "Figma UI/UX Design System & Learner Dashboard Wireframes" "Week 39" "frontend" "$USER_NGUYEN" \
"Thiết kế UI Design System (màu sắc, typography) và wireframe Cổng học viên, Video/Slide Player kèm vị trí Side-drawer Trợ lý AI."

create_task "UI Wireframes for Instructor Builder & Admin Dashboard (M6)" "Week 39" "frontend" "$USER_DUC" \
"Thiết kế giao diện tạo khóa học, soạn bài trắc nghiệm/bài tập nộp file và dashboard số liệu quản trị."

create_task "Relational Database Schema & PostgreSQL Migrations" "Week 39" "backend" "$USER_MINH" \
"Thiết kế ERD đầy đủ các thực thể (Users, Courses, Lessons, Quizzes...) và cấu hình PostgreSQL migrations."

create_task "Implement Authentication & RBAC Engine (M1)" "Week 40" "backend,security" "$USER_MINH" \
"Hiện thực API JWT Authentication (HttpOnly cookie), băm mật khẩu Argon2/bcrypt và phân quyền 3 vai trò (Student, Instructor, Admin)."

create_task "Setup Docker Sandbox Research for Code Execution" "Week 40" "infra,security" "$USER_TAM" \
"Nghiên cứu và thử nghiệm Docker container cô lập (network=none, giới hạn RAM 128MB, CPU) để chuẩn bị môi trường chạy code an toàn."

# --- GIAI ĐOẠN 2: CHỨC NĂNG CỐT LÕI & PROTOTYPE NÂNG CAO (W41 - W44) ---
create_task "Course Catalog, Search & Filtering API (M2)" "Week 41" "backend" "$USER_MINH" \
"Xây dựng API phân trang, tìm kiếm, lọc khóa học và đặc tả cấu trúc bài học/chương mục."

create_task "Course Catalog & Responsive Player Frontend Implementation" "Week 41" "frontend" "$USER_NGUYEN" \
"Dựng giao diện catalog tìm kiếm và màn hình xem video/slide bài học, có đánh dấu hoàn thành bài học."

create_task "Enrollment & Progress Tracking Services (M3)" "Week 41" "backend" "$USER_PHAT" \
"Xử lý đăng ký khóa học, theo dõi tỷ lệ hoàn thành bài học và lưu vị trí tiếp tục học (resume state)."

create_task "Assessment Engine: Auto-Graded Quiz & File Submission (M4)" "Week 42" "backend" "$USER_PHAT" \
"Xây dựng API làm bài trắc nghiệm tính giờ, chấm tự động trắc nghiệm và API nộp file bài tập kèm rubric chấm điểm."

create_task "Instructor Course Authoring & Quiz Creation UI" "Week 42" "frontend" "$USER_DUC" \
"Giao diện cho giảng viên soạn khóa học, upload slide/video và tạo ngân hàng câu hỏi trắc nghiệm."

create_task "Courseware Chunking & pgvector Ingestion Pipeline (Track 1)" "Week 42" "ai-rag,infra" "$USER_NHA" \
"Xây dựng pipeline phân đoạn slide PDF và transcript video thành các chunks có gắn metadata; tạo embeddings lưu vào pgvector."

create_task "Contextual RAG Side-Drawer UI & Streaming Chat (Track 1)" "Week 43" "frontend,ai-rag" "$USER_NGUYEN" \
"Tích hợp khung chat Trợ lý AI ngay trong trình phát bài học; hiển thị câu trả lời stream và thẻ trích dẫn bài giảng."

create_task "RAG Retrieval Guardrails & Out-of-Scope Fallback (Track 1)" "Week 43" "ai-rag,backend" "$USER_NHA" \
"Thiết lập bộ lọc từ chối câu hỏi ngoài phạm vi môn học; gợi ý đăng lên diễn đàn và lưu lượt vote Thumbs-Up/Down."

create_task "Staging Cloud Deployment & Infrastructure Baseline" "Week 44" "devops,infra" "$USER_NHAN" \
"Triển khai bản chạy thử lên cloud công khai có URL truy cập, cấu hình reverse proxy và chứng chỉ SSL."

create_task "Staging Performance Benchmarking & Interim QA Report" "Week 44" "testing,documentation" "$USER_TAM" \
"Thực hiện kiểm thử tải (stress test/load test) API trên môi trường staging và tổng hợp số liệu vào Interim Report (max 10 trang)."

# --- GIAI ĐOẠN 3: TƯƠNG TÁC, QUẢN TRỊ & BENCHMARK ĐÁNH GIÁ (W45 - W47) ---
create_task "Lesson Discussion Threads, Notifications & Report Abuse (M5)" "Week 45" "backend" "$USER_PHAT" \
"Hiện thực bình luận trao đổi theo từng bài học, thông báo điểm số/hạn nộp và cơ chế gắn cờ báo cáo vi phạm."

create_task "Admin Dashboard & Basic Operational Reports (M6)" "Week 45" "frontend" "$USER_DUC" \
"Xây dựng giao diện quản trị viên quản lý người dùng, khóa học, duyệt vi phạm và xem biểu đồ tỷ lệ hoàn thành."

create_task "RAGAS Benchmark Evaluation across 100 Syllabus QA Pairs (Track 1)" "Week 46" "ai-rag,testing" "$USER_NHA" \
"Đo lường các chỉ số Groundedness (>=90%), Citation Precision (>=85%) và Rejection Rate trên tập 100 câu hỏi test thực tế."

create_task "Automated E2E Testing Suite (Playwright)" "Week 47" "testing" "$USER_TAM" \
"Viết kịch bản kiểm thử tự động End-to-End cho luồng chính: Đăng ký -> Học bài -> Làm Quiz -> Hỏi Trợ lý AI -> Xem điểm."

create_task "Security Hardening & OWASP Audits" "Week 47" "security,devops" "$USER_NHAN" \
"Kiểm tra bảo mật toàn diện: bảo vệ bí mật môi trường, chống SQL Injection, XSS và cấu hình rate limiting."

# --- GIAI ĐOẠN 4: ĐÓNG GÓI, NGHIỆM THU & BẢO VỆ (W48 - W50) ---
create_task "Production Deployment & Test Account Seeding" "Week 48" "devops" "$USER_NHAN" \
"Triển khai bản production hoàn chỉnh; nạp sẵn dữ liệu mẫu và tạo tài khoản demo cho 3 vai trò (Student, Instructor, Admin)."

create_task "Dry-run Live Demo & Contingency Backup Video Recording" "Week 49" "management" "$USER_NGUYEN" \
"Tổng duyệt buổi thuyết trình demo theo đúng phân vai 7 thành viên; quay video dự phòng đầy đủ luồng sản phẩm."

create_task "Final Report, Code Freeze Release v1.0.0 & Final Submission" "Week 50" "documentation,management" "$USER_NGUYEN" \
"Đóng gói toàn bộ sản phẩm: Final report, link deployment, tài khoản demo, slide, release tag v1.0.0 trước 23:59 CN 13/12/2026."

echo "==> HOÀN TẤT! Toàn bộ 24 Issues đã được phân bổ đều và đưa vào Backlog của GitHub Project thành công."