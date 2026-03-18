# NexAttend - Day-by-Day Team Plan

## 📅 8-Week Development Schedule (40 Working Days)

**Team Members:** Kumuthu (Lead), Thiviru (Frontend Lead), Yasitha (Frontend), Sudam (Backend Lead), Thisandu (Backend), Viraj (AI)

---

# 🟦 SPRINT 1: CORE DEVELOPMENT (Weeks 1-4)

---

## Week 1: Project Foundation & Setup

### Day 1 (Monday) — Repository & Environment Setup

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create GitHub repo, set branch protection rules, add PR templates, create issue labels | Repository ready with rules | `main` |
| **Thiviru** | Initialize React project with Vite, configure folder structure | Empty React app runs | `feature/frontend/project-setup` |
| **Yasitha** | Research Tailwind CSS setup, prepare component library list | Setup documentation | — |
| **Sudam** | Initialize FastAPI project, create folder structure | FastAPI "Hello World" runs | `feature/backend/project-setup` |
| **Thisandu** | Set up local MongoDB, create database and collections | MongoDB running locally | — |
| **Viraj** | Set up Python virtual environment, install OpenCV | OpenCV imports successfully | `feature/ai/environment-setup` |

**End of Day Checklist:**
- [ ] GitHub repo created with protection rules
- [ ] React app runs on localhost:3000
- [ ] FastAPI runs on localhost:8000
- [ ] MongoDB running on localhost:27017
- [ ] All members have cloned repo

---

### Day 2 (Tuesday) — Configuration & Base Structure

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create project documentation (README, SETUP.md), set up ClickUp board | Documentation ready | `docs/project-setup` |
| **Thiviru** | Install & configure Tailwind CSS, set up routing (React Router) | Tailwind working, routes defined | `feature/frontend/project-setup` |
| **Yasitha** | Create base layout components (Navbar, Sidebar, Footer) | Layout components ready | `feature/frontend/layout-components` |
| **Sudam** | Configure CORS, create config.py, set up environment variables | Backend config complete | `feature/backend/project-setup` |
| **Thisandu** | Create MongoDB connection module, test connection | DB connection works | `feature/backend/db-connection` |
| **Viraj** | Install MTCNN, test basic face detection on sample image | MTCNN detects face | `feature/ai/environment-setup` |

**End of Day Checklist:**
- [ ] Tailwind classes work in React
- [ ] API accepts requests from frontend (CORS)
- [ ] Database connects from Python
- [ ] MTCNN detects at least one face

---

### Day 3 (Wednesday) — Base Models & Components

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Install DeepFace, test embedding generation on sample image | DeepFace generates embedding | `feature/ai/deepface-setup` |
| **Thiviru** | Create reusable Button, Input, Card components | UI components library | `feature/frontend/ui-components` |
| **Yasitha** | Create Modal, Alert, Loading spinner components | More UI components | `feature/frontend/ui-components` |
| **Sudam** | Create User model (Pydantic schema) | User schema defined | `feature/backend/user-model` |
| **Thisandu** | Create Student model, Classroom model | Student/Classroom schemas | `feature/backend/student-model` |
| **Viraj** | Create camera_service.py — capture frame from webcam | Webcam capture works | `feature/ai/camera-service` |

**End of Day Checklist:**
- [ ] DeepFace returns 128/512-dim vector
- [ ] At least 5 reusable UI components
- [ ] User, Student, Classroom models defined
- [ ] Webcam opens and captures frame

---

### Day 4 (Thursday) — API Structure & AI Pipeline Start

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create face_detector.py with MTCNN, return bounding boxes | Face detector class ready | `feature/ai/face-detector` |
| **Thiviru** | Create pages structure (Home, Login, Register, Dashboard) | Page components created | `feature/frontend/pages-setup` |
| **Yasitha** | Style Navbar and Sidebar with navigation links | Navigation works | `feature/frontend/layout-components` |
| **Sudam** | Create auth routes structure (/login, /register) | Auth endpoints exist (empty) | `feature/backend/auth-routes` |
| **Thisandu** | Create student routes structure (/students CRUD) | Student endpoints exist | `feature/backend/student-routes` |
| **Viraj** | Create image_processor.py — resize, BGR to RGB conversion | Image processing utils ready | `feature/ai/image-processor` |

**End of Day Checklist:**
- [ ] face_detector.py returns list of face boxes
- [ ] All pages accessible via routes
- [ ] API has /auth and /students route groups
- [ ] Images can be preprocessed for AI

---

### Day 5 (Friday) — Integration Test & Week 1 Review

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create face_recognizer.py — generate embeddings | Face recognizer class ready | `feature/ai/face-recognizer` |
| **Thiviru** | Connect frontend to backend (test API call) | Frontend fetches from API | `feature/frontend/api-integration` |
| **Yasitha** | Create api.js service with Axios, base URL config | API service ready | `feature/frontend/api-service` |
| **Sudam** | Implement basic health check endpoint, test DB connection | /health returns DB status | `feature/backend/health-check` |
| **Thisandu** | Create database initialization script | DB init script works | `feature/backend/db-init` |
| **Viraj** | Test full pipeline: camera → detect → crop face | Pipeline test passes | `feature/ai/pipeline-test` |

**🔄 End of Week 1 — Team Sync Meeting**
- Review all PRs and merge to `develop`
- Demo: Show working frontend + backend + AI detection
- Plan Week 2 tasks in detail

**Week 1 Commit Target: 8 commits/person = 48 total**

---

## Week 2: Authentication & Registration

### Day 6 (Monday) — Login System Start

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Code review Week 1 PRs, merge approved ones | Clean `develop` branch | — |
| **Thiviru** | Create Login page UI (email, password, submit) | Login form complete | `feature/frontend/login-page` |
| **Yasitha** | Create form validation utils, error display | Validation works | `feature/frontend/form-validation` |
| **Sudam** | Implement password hashing (bcrypt) | Passwords hash correctly | `feature/backend/auth-security` |
| **Thisandu** | Create /register endpoint — save user to DB | Registration saves user | `feature/backend/register-endpoint` |
| **Viraj** | Optimize face detector for multiple faces | Multi-face detection works | `feature/ai/multi-face-detection` |

---

### Day 7 (Tuesday) — JWT Authentication

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create embedding_service.py — compare two embeddings | Similarity score returned | `feature/ai/embedding-service` |
| **Thiviru** | Create Registration page UI (name, email, password, role) | Registration form complete | `feature/frontend/registration-page` |
| **Yasitha** | Add image upload component to registration | Image upload works | `feature/frontend/image-upload` |
| **Sudam** | Implement JWT token generation and verification | JWT tokens work | `feature/backend/jwt-auth` |
| **Thisandu** | Create /login endpoint — verify credentials, return token | Login returns token | `feature/backend/login-endpoint` |
| **Viraj** | Test embedding comparison with 2 images of same person | Same person → high similarity | `feature/ai/embedding-comparison` |

---

### Day 8 (Wednesday) — Protected Routes

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create face registration API endpoint | /face/register endpoint ready | `feature/ai/face-register-api` |
| **Thiviru** | Create AuthContext for storing user state | Auth context works | `feature/frontend/auth-context` |
| **Yasitha** | Create ProtectedRoute component | Protected routes redirect | `feature/frontend/protected-routes` |
| **Sudam** | Create auth middleware — verify JWT on protected routes | Middleware blocks invalid tokens | `feature/backend/auth-middleware` |
| **Thisandu** | Create /me endpoint — get current user from token | /me returns user data | `feature/backend/me-endpoint` |
| **Viraj** | Test embedding comparison with different people | Different people → low similarity | `feature/ai/embedding-comparison` |

---

### Day 9 (Thursday) — Student Registration with Face

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Integrate face embedding into registration flow | Face saved with student | `feature/ai/face-register-api` |
| **Thiviru** | Create Student Registration page (different from user) | Student reg page ready | `feature/frontend/student-registration` |
| **Yasitha** | Add webcam capture option (alternative to upload) | Webcam capture works | `feature/frontend/webcam-capture` |
| **Sudam** | Create FaceEmbedding model in database | Embedding schema ready | `feature/backend/embedding-model` |
| **Thisandu** | Create /students/register endpoint with face | Student + face saves | `feature/backend/student-register` |
| **Viraj** | Create threshold testing script (find optimal value) | Optimal threshold documented | `feature/ai/threshold-testing` |

---

### Day 10 (Friday) — Integration & Week 2 Review

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Test full registration flow: UI → API → DB → Face | Full flow works | — |
| **Thiviru** | Connect login/register forms to API | Forms submit to backend | `feature/frontend/auth-integration` |
| **Yasitha** | Add loading states, success/error messages | UX feedback complete | `feature/frontend/auth-integration` |
| **Sudam** | Test JWT flow end-to-end | Auth fully working | `feature/backend/auth-testing` |
| **Thisandu** | Write API documentation for auth endpoints | Auth docs complete | `docs/api-auth` |
| **Viraj** | Document AI pipeline with diagrams | AI docs complete | `docs/ai-pipeline` |

**🔄 End of Week 2 — Team Sync Meeting**
- Demo: User registration with face embedding
- Demo: Login and protected routes
- Merge all to `develop`

**Week 2 Commit Target: 10 commits/person = 60 total**

---

## Week 3: Face Recognition Core

### Day 11 (Monday) — Attendance Session Setup

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Design attendance marking flow (sequence diagram) | Flow documented | `docs/attendance-flow` |
| **Thiviru** | Create Classroom page UI | Classroom page ready | `feature/frontend/classroom-page` |
| **Yasitha** | Create "Start Attendance" button with webcam trigger | Button opens webcam | `feature/frontend/start-attendance` |
| **Sudam** | Create Attendance model (session, date, records) | Attendance schema ready | `feature/backend/attendance-model` |
| **Thisandu** | Create /attendance/start endpoint | Session starts in DB | `feature/backend/attendance-start` |
| **Viraj** | Create real-time frame capture loop (1 fps) | Frame loop runs | `feature/ai/frame-capture-loop` |

---

### Day 12 (Tuesday) — Single Face Recognition

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create /face/detect endpoint — single face | Detection API works | `feature/ai/face-detect-api` |
| **Thiviru** | Display webcam feed in browser | Live feed visible | `feature/frontend/webcam-display` |
| **Yasitha** | Add face bounding box overlay on video | Boxes drawn on faces | `feature/frontend/face-overlay` |
| **Sudam** | Create endpoint to get all embeddings for a class | /class/:id/embeddings works | `feature/backend/class-embeddings` |
| **Thisandu** | Create /attendance/mark endpoint | Attendance record saved | `feature/backend/attendance-mark` |
| **Viraj** | Implement single face → embedding → match flow | Single face recognized | `feature/ai/single-face-recognition` |

---

### Day 13 (Wednesday) — Recognition Pipeline

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create /face/recognize endpoint — returns student ID | Recognition API works | `feature/ai/face-recognize-api` |
| **Thiviru** | Send frames to backend at interval (every 2 sec) | Frames sent to API | `feature/frontend/frame-sending` |
| **Yasitha** | Display recognition result (name) on screen | Name shows on match | `feature/frontend/recognition-display` |
| **Sudam** | Optimize embedding query (index on classroom_id) | Query is fast | `feature/backend/db-optimization` |
| **Thisandu** | Log recognition attempts (student_id, confidence, time) | Logs saved to DB | `feature/backend/recognition-logs` |
| **Viraj** | Test recognition with 3-5 registered faces | 80%+ accuracy | `feature/ai/recognition-testing` |

---

### Day 14 (Thursday) — Multi-Face Recognition

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Extend /face/recognize for multiple faces | Multi-face API works | `feature/ai/multi-face-api` |
| **Thiviru** | Handle multiple recognition results in UI | Multiple names display | `feature/frontend/multi-recognition` |
| **Yasitha** | Add attendance list panel (shows who's marked) | Live attendance list | `feature/frontend/attendance-list` |
| **Sudam** | Batch update attendance records | Batch insert works | `feature/backend/batch-attendance` |
| **Thisandu** | Add duplicate check (don't mark twice) | No duplicates | `feature/backend/duplicate-check` |
| **Viraj** | Test with 5+ faces in single frame | All faces detected | `feature/ai/multi-face-testing` |

---

### Day 15 (Friday) — Week 3 Integration

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Full pipeline test: Webcam → Detect → Recognize → Mark | Complete flow works | — |
| **Thiviru** | Add "Stop Attendance" button, cleanup | Session ends cleanly | `feature/frontend/stop-attendance` |
| **Yasitha** | Polish attendance UI, add animations | UI looks good | `feature/frontend/attendance-polish` |
| **Sudam** | Create /attendance/session/:id endpoint | Get session results | `feature/backend/session-results` |
| **Thisandu** | Test API with Postman, document endpoints | API docs updated | `docs/api-attendance` |
| **Viraj** | Performance testing — measure detection speed | Speed documented | `docs/ai-performance` |

**🔄 End of Week 3 — Major Demo**
- Demo: Live face recognition marking attendance
- This is the CORE feature — must work!

**Week 3 Commit Target: 12 commits/person = 72 total**

---

## Week 4: Dashboard & First Deployment

### Day 16 (Monday) — Dashboard Structure

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Code review, ensure AI pipeline is stable | Stable AI code | — |
| **Thiviru** | Create Teacher Dashboard layout | Dashboard structure ready | `feature/frontend/teacher-dashboard` |
| **Yasitha** | Create Student Dashboard layout | Student dashboard ready | `feature/frontend/student-dashboard` |
| **Sudam** | Create /dashboard/stats endpoint (counts, percentages) | Stats API works | `feature/backend/dashboard-stats` |
| **Thisandu** | Create /students/:id/attendance endpoint | Student history works | `feature/backend/student-history` |
| **Viraj** | Optimize AI for low-light conditions | Better accuracy | `feature/ai/lighting-optimization` |

---

### Day 17 (Tuesday) — Dashboard Data

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Add confidence score to recognition response | Confidence visible | `feature/ai/confidence-score` |
| **Thiviru** | Add stats cards (total students, present, absent) | Stats cards display | `feature/frontend/stats-cards` |
| **Yasitha** | Add attendance percentage display for student | Student sees % | `feature/frontend/student-percentage` |
| **Sudam** | Create /classroom/:id/attendance/history endpoint | History API works | `feature/backend/attendance-history` |
| **Thisandu** | Add date filtering to history endpoint | Filter by date works | `feature/backend/date-filter` |
| **Viraj** | Test with different angles (front, side) | Document accuracy by angle | `feature/ai/angle-testing` |

---

### Day 18 (Wednesday) — Attendance History UI

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Review & merge all AI features to develop | AI code merged | — |
| **Thiviru** | Create attendance history table component | Table displays history | `feature/frontend/history-table` |
| **Yasitha** | Add date picker for filtering history | Date filter works | `feature/frontend/date-picker` |
| **Sudam** | Add pagination to history endpoint | Pagination works | `feature/backend/history-pagination` |
| **Thisandu** | Create classroom list endpoint | /classrooms returns list | `feature/backend/classroom-list` |
| **Viraj** | Create AI configuration file (thresholds, model name) | Config externalized | `feature/ai/config-file` |

---

### Day 19 (Thursday) — Deployment Preparation

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create deployment documentation | Deploy docs ready | `docs/deployment` |
| **Thiviru** | Build frontend for production, test build | Build succeeds | `feature/frontend/production-build` |
| **Yasitha** | Add environment variable handling (.env) | Env vars work | `feature/frontend/env-config` |
| **Sudam** | Create Dockerfile for backend | Docker builds | `feature/backend/dockerfile` |
| **Thisandu** | Set up MongoDB Atlas (cloud database) | Cloud DB ready | — |
| **Viraj** | Test AI with cloud DB connection | AI works with cloud | `feature/ai/cloud-testing` |

---

### Day 20 (Friday) — First Deployment 🚀

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Coordinate deployment, test on staging | Staging works | — |
| **Thiviru** | Deploy frontend to Vercel | Frontend live | `release/staging-v0.1` |
| **Yasitha** | Test all UI flows on deployed version | UI bugs logged | — |
| **Sudam** | Deploy backend to Render/Railway | Backend live | `release/staging-v0.1` |
| **Thisandu** | Test all API endpoints on staging | API bugs logged | — |
| **Viraj** | Test face recognition on staging | AI works on server | — |

**🔄 End of Week 4 — Staging Deployment Complete**
- Staging URL working
- Core features functional
- Bug list created for Sprint 2

**Week 4 Commit Target: 12 commits/person = 72 total**

---

# 🟩 SPRINT 2: FEATURES & POLISH (Weeks 5-8)

---

## Week 5: Email, Analytics & Enhancements

### Day 21 (Monday) — Email System Setup

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Sprint 2 planning, prioritize bug fixes | Sprint plan ready | — |
| **Thiviru** | Create Analytics page structure | Analytics page ready | `feature/frontend/analytics-page` |
| **Yasitha** | Research and set up Recharts library | Charts render | `feature/frontend/charts-setup` |
| **Sudam** | Set up SendGrid account, configure API | SendGrid configured | `feature/backend/email-setup` |
| **Thisandu** | Create email_service.py with send function | Email sends | `feature/backend/email-service` |
| **Viraj** | Fix bugs from Week 4 deployment | Bugs fixed | `bugfix/ai/*` |

---

### Day 22 (Tuesday) — Email Templates

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create email templates (attendance summary) | Templates ready | `feature/backend/email-templates` |
| **Thiviru** | Create attendance chart (daily/weekly) | Charts display data | `feature/frontend/attendance-chart` |
| **Yasitha** | Create pie chart (present vs absent) | Pie chart works | `feature/frontend/pie-chart` |
| **Sudam** | Trigger email after attendance session ends | Email auto-sends | `feature/backend/auto-email` |
| **Thisandu** | Create email log (track sent emails) | Logs saved | `feature/backend/email-log` |
| **Viraj** | Improve face detection speed | Faster detection | `feature/ai/speed-optimization` |

---

### Day 23 (Wednesday) — Analytics Backend

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Review analytics requirements, define metrics | Metrics defined | — |
| **Thiviru** | Add line chart (attendance over time) | Line chart works | `feature/frontend/line-chart` |
| **Yasitha** | Add student ranking display | Rankings show | `feature/frontend/student-ranking` |
| **Sudam** | Create /analytics/summary endpoint | Summary API works | `feature/backend/analytics-summary` |
| **Thisandu** | Create /analytics/trends endpoint | Trends API works | `feature/backend/analytics-trends` |
| **Viraj** | Add face quality check (blur, brightness) | Quality check works | `feature/ai/quality-check` |

---

### Day 24 (Thursday) — Motivation Scoring

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Define motivation scoring algorithm | Algorithm documented | `docs/motivation-scoring` |
| **Thiviru** | Display motivation score on student dashboard | Score visible | `feature/frontend/motivation-display` |
| **Yasitha** | Add badges/achievements UI | Badges show | `feature/frontend/badges` |
| **Sudam** | Implement motivation calculation (+0.5 per session) | Score updates | `feature/backend/motivation-calc` |
| **Thisandu** | Add motivation score to student model | Field added | `feature/backend/motivation-field` |
| **Viraj** | Test AI on staging, fix issues | Staging AI stable | `bugfix/ai/staging-fixes` |

---

### Day 25 (Friday) — Week 5 Review

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Integration testing — email + analytics | Features integrated | — |
| **Thiviru** | Connect charts to real API data | Live data in charts | `feature/frontend/charts-integration` |
| **Yasitha** | Polish analytics page UI | UI polished | `feature/frontend/analytics-polish` |
| **Sudam** | Test email delivery, fix issues | Emails deliver | `bugfix/backend/email-fixes` |
| **Thisandu** | API documentation update | Docs updated | `docs/api-analytics` |
| **Viraj** | Document AI configuration guide | AI docs complete | `docs/ai-configuration` |

**🔄 End of Week 5**
- Email notifications working
- Analytics dashboard with charts
- Motivation scoring active

**Week 5 Commit Target: 10 commits/person = 60 total**

---

## Week 6: Remaining Features

### Day 26 (Monday) — Anomaly Detection

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Implement anomaly flagging (low confidence) | Anomalies flagged | `feature/ai/anomaly-detection` |
| **Thiviru** | Create manual review page | Review page ready | `feature/frontend/manual-review` |
| **Yasitha** | Add "Flagged" indicator in attendance list | Flags visible | `feature/frontend/flagged-indicator` |
| **Sudam** | Create /attendance/flagged endpoint | Flagged records return | `feature/backend/flagged-endpoint` |
| **Thisandu** | Create /attendance/update endpoint (manual fix) | Manual update works | `feature/backend/manual-update` |
| **Viraj** | Fine-tune anomaly threshold | Threshold optimized | `feature/ai/anomaly-threshold` |

---

### Day 27 (Tuesday) — Manual Attendance

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Review anomaly detection accuracy | Accuracy documented | — |
| **Thiviru** | Add approve/reject buttons for flagged | Buttons work | `feature/frontend/review-actions` |
| **Yasitha** | Add manual "Mark Present" option | Manual marking works | `feature/frontend/manual-mark` |
| **Sudam** | Add "reviewed" status to attendance record | Status field added | `feature/backend/review-status` |
| **Thisandu** | Create audit log for manual changes | Audit log works | `feature/backend/audit-log` |
| **Viraj** | Create confidence calibration tool | Calibration works | `feature/ai/confidence-calibration` |

---

### Day 28 (Wednesday) — CSV Export

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Review all features, create bug list | Bug list ready | — |
| **Thiviru** | Add "Export CSV" button to dashboard | Button exists | `feature/frontend/export-button` |
| **Yasitha** | Add date range selector for export | Date range works | `feature/frontend/export-date-range` |
| **Sudam** | Create /export/csv endpoint | CSV downloads | `feature/backend/csv-export` |
| **Thisandu** | Add filters to export (class, date, status) | Filters work | `feature/backend/export-filters` |
| **Viraj** | Bug fixes from testing | Bugs fixed | `bugfix/ai/*` |

---

### Day 29 (Thursday) — Classroom Features

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Overall system testing | Test report created | — |
| **Thiviru** | Create classroom management page | Page ready | `feature/frontend/classroom-management` |
| **Yasitha** | Add create/edit classroom form | Forms work | `feature/frontend/classroom-form` |
| **Sudam** | Create /classroom CRUD endpoints | CRUD works | `feature/backend/classroom-crud` |
| **Thisandu** | Add student assignment to classroom | Assignment works | `feature/backend/student-assignment` |
| **Viraj** | Test AI with new classroom data | AI works | — |

---

### Day 30 (Friday) — Week 6 Integration

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Full feature review, merge to develop | All features merged | — |
| **Thiviru** | UI review, list remaining issues | UI issues logged | — |
| **Yasitha** | Mobile responsiveness check | Mobile issues logged | — |
| **Sudam** | API stability check | API issues logged | — |
| **Thisandu** | Data integrity check | DB issues logged | — |
| **Viraj** | AI accuracy final measurement | Accuracy documented | — |

**🔄 End of Week 6 — Feature Complete**
- All features implemented
- Bug list finalized for Week 7

**Week 6 Commit Target: 10 commits/person = 60 total**

---

## Week 7: Bug Fixes & Optimization

### Day 31 (Monday) — Critical Bug Fixes

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Prioritize bugs (P1, P2, P3), assign to team | Bug assignments done | — |
| **Thiviru** | Fix P1 frontend bugs | P1 bugs fixed | `bugfix/frontend/*` |
| **Yasitha** | Fix P2 frontend bugs | P2 bugs fixed | `bugfix/frontend/*` |
| **Sudam** | Fix P1 backend bugs | P1 bugs fixed | `bugfix/backend/*` |
| **Thisandu** | Fix P2 backend bugs | P2 bugs fixed | `bugfix/backend/*` |
| **Viraj** | Fix AI accuracy issues | AI bugs fixed | `bugfix/ai/*` |

---

### Day 32 (Tuesday) — More Bug Fixes

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Fix AI edge cases (glasses, masks) | Edge cases handled | `bugfix/ai/edge-cases` |
| **Thiviru** | Fix navigation issues | Nav bugs fixed | `bugfix/frontend/navigation` |
| **Yasitha** | Fix form validation bugs | Forms work correctly | `bugfix/frontend/forms` |
| **Sudam** | Fix authentication edge cases | Auth bugs fixed | `bugfix/backend/auth` |
| **Thisandu** | Fix database query issues | DB bugs fixed | `bugfix/backend/database` |
| **Viraj** | Optimize detection for group photos | Group detection better | `bugfix/ai/group-detection` |

---

### Day 33 (Wednesday) — Performance Optimization

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Profile AI performance, find bottlenecks | Bottlenecks identified | — |
| **Thiviru** | Optimize React re-renders | Fewer re-renders | `refactor/frontend/performance` |
| **Yasitha** | Lazy load components, images | Faster load time | `refactor/frontend/lazy-loading` |
| **Sudam** | Add database indexes | Faster queries | `refactor/backend/db-indexes` |
| **Thisandu** | Add API response caching | Faster responses | `refactor/backend/caching` |
| **Viraj** | Reduce embedding comparison time | Faster matching | `refactor/ai/comparison-speed` |

---

### Day 34 (Thursday) — UI Polish

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Final AI testing with 20+ students | Accuracy documented | — |
| **Thiviru** | Final color scheme, typography fixes | Consistent styling | `refactor/frontend/styling` |
| **Yasitha** | Mobile responsiveness final fixes | Mobile works | `refactor/frontend/mobile` |
| **Sudam** | Error messages improvement | Better errors | `refactor/backend/error-messages` |
| **Thisandu** | API response standardization | Consistent responses | `refactor/backend/response-format` |
| **Viraj** | Create fallback for poor lighting | Fallback works | `feature/ai/lighting-fallback` |

---

### Day 35 (Friday) — Week 7 Review

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Complete system walkthrough | Walkthrough documented | — |
| **Thiviru** | Frontend final review | Frontend ready | — |
| **Yasitha** | User flow testing | Flows work | — |
| **Sudam** | Backend final review | Backend ready | — |
| **Thisandu** | API documentation final | Docs complete | — |
| **Viraj** | AI final review | AI ready | — |

**🔄 End of Week 7**
- All P1 and P2 bugs fixed
- Performance optimized
- Ready for final deployment

**Week 7 Commit Target: 8 commits/person = 48 total**

---

## Week 8: Final Testing & Deployment

### Day 36 (Monday) — End-to-End Testing

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Create E2E test plan | Test plan ready | — |
| **Thiviru** | Test: Registration flow | Test passed | — |
| **Yasitha** | Test: Login flow | Test passed | — |
| **Sudam** | Test: Attendance marking flow | Test passed | — |
| **Thisandu** | Test: Dashboard and analytics | Test passed | — |
| **Viraj** | Test: Face recognition accuracy | Test passed | — |

---

### Day 37 (Tuesday) — Final Bug Fixes

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **All** | Fix any remaining bugs found in E2E testing | All bugs fixed | `bugfix/*` |

---

### Day 38 (Wednesday) — Production Deployment

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Coordinate production deployment | Deployment plan | — |
| **Thiviru** | Deploy frontend to production (Vercel) | Frontend live | `release/v1.0` |
| **Yasitha** | Test production frontend | Frontend works | — |
| **Sudam** | Deploy backend to production (Render) | Backend live | `release/v1.0` |
| **Thisandu** | Test production API | API works | — |
| **Viraj** | Test production AI | AI works | — |

---

### Day 39 (Thursday) — Demo Preparation

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Prepare demo script, record demo video | Demo ready | — |
| **Thiviru** | Prepare UI screenshots for documentation | Screenshots ready | — |
| **Yasitha** | Create user guide | Guide ready | `docs/user-guide` |
| **Sudam** | Prepare API documentation PDF | API docs ready | — |
| **Thisandu** | Prepare database documentation | DB docs ready | — |
| **Viraj** | Prepare AI documentation | AI docs ready | — |

---

### Day 40 (Friday) — Final Review & Submission 🎉

| Member | Tasks | Deliverable | Branch |
|--------|-------|-------------|--------|
| **Kumuthu** | Final project review, GitHub cleanup | Project complete | `main` |
| **Thiviru** | Merge all frontend to main | Frontend merged | — |
| **Yasitha** | Final testing on production | All tests pass | — |
| **Sudam** | Merge all backend to main | Backend merged | — |
| **Thisandu** | Commit count verification | Counts verified | — |
| **Viraj** | Merge all AI to main | AI merged | — |

**🎉 PROJECT COMPLETE**

**Week 8 Commit Target: 5 commits/person = 30 total**

---

# 📊 Summary

## Total Commits Target

| Week | Per Person | Team Total |
|------|------------|------------|
| 1 | 8 | 48 |
| 2 | 10 | 60 |
| 3 | 12 | 72 |
| 4 | 12 | 72 |
| 5 | 10 | 60 |
| 6 | 10 | 60 |
| 7 | 8 | 48 |
| 8 | 5 | 30 |
| **Total** | **75** | **450** |

---

## Key Milestones

| Day | Milestone |
|-----|-----------|
| Day 5 | ✅ Project setup complete, all systems running |
| Day 10 | ✅ Authentication working, face registration works |
| Day 15 | ✅ **Core feature: Face recognition marks attendance** |
| Day 20 | ✅ First deployment (staging) |
| Day 25 | ✅ Email notifications + Analytics |
| Day 30 | ✅ Feature complete |
| Day 35 | ✅ Bugs fixed, optimized |
| Day 40 | 🎉 **Project submitted** |

---

## Critical Days (Must Not Miss)

| Day | Why |
|-----|-----|
| Day 15 | Core face recognition must work |
| Day 20 | First deployment validates everything |
| Day 30 | Feature freeze — no new features after this |
| Day 38 | Production deployment |

---

## Daily Standup Questions

Every team member answers these 3 questions each morning:

```
1. What did I complete yesterday?
2. What will I do today?
3. Any blockers?
```

---

**Good luck, team! 🚀**
