# CO3103: Programming Integration Project (HK261)
## Online Learning Platform — Group 10

---

## 📌 Project Overview

This project is developed as part of **CO3103 (Software Engineering Integration Project - Semester 261)** at Ho Chi Minh City University of Technology (HCMUT). The objective is to design, implement, test, and deploy a production-ready **Online Learning Platform** tailored for a dedicated learning domain.

---

## 👥 User Roles & Access Control

The platform enforces Role-Based Access Control (RBAC) across three primary actors:

| Role | Core Responsibilities |
| :--- | :--- |
| **Learner** | Discover courses, enroll, track study progress, submit assignments/quizzes, and interact via discussion channels. |
| **Instructor** | Create/manage course syllabus, upload learning materials, design assessments, grade submissions, and monitor student progress. |
| **Administrator** | Manage user accounts, moderate courses and categories, audit system operations, and inspect analytical reports. |

---

## 🎯 Functional Scope

### 1. Mandatory Core Modules
- **Authentication & Authorization:** Secure registration, login, logout, password recovery, profile management, and role-guarded APIs.
- **Course & Content Management:** Searchable course catalog with filters/pagination, multi-format learning resources (video, document, slides), modular syllabus (chapters/lessons), and publishing controls.
- **Enrollment & Learning Tracking:** One-click enrollment, sequential module progression, automatic progress persistence, and resume-from-last-viewed.
- **Assessments & Grading:** Multiple-choice quizzes with automated grading, file-submission assignments with deadline constraints, instructor feedback, and grading history.
- **Interaction & Alerts:** Lesson-based discussion forums / Q&A threads, in-app notifications for deadlines/updates, and content reporting mechanisms.
- **Administration & Reporting:** User and course lifecycle management, audit logs, and core performance metrics (enrollment counts, completion rates).

### 2. Advanced Component (Selected Research Direction)
*The platform integrates at least one measurable, verifiable advanced module:*
- **Track 1:** Grounded AI Teaching Assistant (RAG-based contextual Q&A citing course references).
- **Track 2:** Personalized Learning Path & Recommendation Engine.
- **Track 3:** Mastery-Based Adaptive Learning & Skill Trees.
- **Track 4:** Automated Code Assessment Sandbox & Academic Integrity Guard.
- **Track 5:** Learning Analytics & Early Warning Prediction System.
- **Track 6:** Real-Time Collaborative Classroom & Live Study Rooms.
- **Track 7:** Offline-First PWA with Background Sync & WCAG Accessibility.

---

## 🛡️ Engineering Standards & Quality Constraints

- **Security & Privacy:** Passwords hashed with secure algorithms (e.g., bcrypt/argon2), environment variables and secrets strictly excluded from source control (`.gitignore`), zero-trust API protection.
- **Responsive UI/UX:** Optimized seamless experience across desktop and mobile browsers.
- **Testing & Reliability:** Automated unit tests for critical business logic and end-to-end (E2E) integration test coverage for primary workflows.
- **Reproducibility & Deployment:** Fully containerized with Docker / Docker Compose, seeded sample data for instant grading, and publicly deployed instance.
- **Engineering Discipline:** Feature branch workflow, atomic commits, pull requests, issue tracking, and weekly progress logs.
- **Language Policy:** All deliverables, source code comments, documentation, and live demonstrations are strictly in **English**.

---

## 📅 Milestones & Assessment Breakdown

| Phase | Deliverable | Weight | Deadline |
| :--- | :--- | :---: | :--- |
| **Phase 1** | **Project Proposal** (Max 4 pages) | **20%** | 23:59 Sunday, Sep 20, 2026 (Week 38) |
| **Phase 2** | **Interim Report & Prototype** (Max 10 pages) | **30%** | 23:59 Sunday, Nov 01, 2026 (Week 44) |
| **Phase 3** | **Final Report & Source Code** | **25%** | 23:59 Sunday, Dec 13, 2026 (Week 50) |
| **Phase 4** | **Final Presentation & Live Demo** | **25%** | Week 50 / Schedule TBA |

---

## 📂 Repository Structure

```text
.
├── frontend/             # Client application (UI/UX)
├── backend/              # Core API server & business logic
├── service/              # Auxiliary / microservices (e.g., AI/RAG, Analytics)
├── docker-compose.yml    # Container orchestration configuration
├── .gitignore            # Git exclusion rules
└── README.md             # Project documentation
```

---

## 🚀 Getting Started

*(Detailed installation and configuration instructions will be updated upon finalizing the technology stack.)*