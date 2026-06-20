@AGENTS.md
================================================================================
  ACADEMY SETU — SCHOOL PORTAL
  Full Project Documentation
  Version 1.0 | June 2025
================================================================================

--------------------------------------------------------------------------------
1. PROJECT OVERVIEW
--------------------------------------------------------------------------------

Academy Setu is a full-stack school management platform comprising:

  - A WEB PORTAL (Next.js 14) for business & operations roles
  - A MOBILE APP (React Native / Expo) for school-facing roles
  - A SHARED BACKEND (PostgreSQL + Prisma + Next.js API)
  - FUTURE SERVICES: WhatsApp API, Payment Gateway, Job Queue, Redis, CDN

Repository structure: Turborepo Monorepo


--------------------------------------------------------------------------------
2. TECH STACK
--------------------------------------------------------------------------------

  Frontend (Web)    : Next.js 14 (App Router), TypeScript, Tailwind CSS
  Frontend (Mobile) : React Native, Expo SDK, Expo Router
  Backend / API     : Next.js Route Handlers (REST/JSON)
  ORM               : Prisma
  Database          : PostgreSQL
  Authentication    : NextAuth.js (JWT strategy)
  State (Mobile)    : Zustand
  Monorepo          : Turborepo
  Future Queue      : BullMQ + Redis (ioredis)
  Future CDN        : Cloudflare R2 / AWS S3
  Future Payments   : Razorpay
  Future WhatsApp   : Meta Cloud API + DLT
  Push Notifications: Expo Push + FCM


--------------------------------------------------------------------------------
3. USER ROLES
--------------------------------------------------------------------------------

  WEB PORTAL (Desktop Browser)
  ─────────────────────────────
  1. Admin        — Full system control, user management, reports
  2. Manager      — Team oversight, BDM performance, targets
  3. BDM          — Lead pipeline, school visits, conversion tracking
  4. Distributor  — Orders, inventory, payments, invoices

  MOBILE APP (iOS + Android)
  ───────────────────────────
  5. Teacher      — Attendance, assignments, timetable, results
  6. Student      — My attendance, assignments, results, fees, notices
  7. Parent       — Child tracking, fees payment, notices, leave requests


--------------------------------------------------------------------------------
4. MONOREPO FOLDER STRUCTURE
--------------------------------------------------------------------------------

  academy-setu/                         ← Turborepo root
  ├── apps/
  │   ├── web/                          ← Next.js 14 portal
  │   └── mobile/                       ← Expo React Native app
  │
  ├── packages/
  │   ├── database/                     ← Prisma schema + client (shared)
  │   │   ├── prisma/schema.prisma
  │   │   └── seed.ts
  │   ├── types/                        ← Shared TypeScript interfaces
  │   ├── validators/                   ← Shared Zod schemas
  │   └── config/                       ← Shared env + constants
  │
  ├── turbo.json
  ├── package.json
  └── .env


--------------------------------------------------------------------------------
5. WEB APP STRUCTURE (apps/web)
--------------------------------------------------------------------------------

  src/
  ├── app/
  │   ├── (auth)/
  │   │   └── login/page.tsx            ← Shared login for all web roles
  │   │
  │   ├── (portal)/                     ← Auth-protected layout
  │   │   ├── layout.tsx                ← JWT guard + Sidebar
  │   │   │
  │   │   ├── admin/
  │   │   │   ├── page.tsx              ← Dashboard KPIs
  │   │   │   ├── schools/              ← Full CRUD: all schools
  │   │   │   ├── users/                ← Create / edit / deactivate users
  │   │   │   ├── distributors/         ← Distributor onboarding
  │   │   │   ├── content/              ← CMS: notices, syllabus
  │   │   │   └── reports/              ← Analytics & exports
  │   │   │
  │   │   ├── manager/
  │   │   │   ├── page.tsx              ← Team dashboard
  │   │   │   ├── bdm/                  ← BDM list + performance view
  │   │   │   ├── targets/              ← Set and track monthly targets
  │   │   │   └── reports/
  │   │   │
  │   │   ├── bdm/
  │   │   │   ├── page.tsx              ← My dashboard
  │   │   │   ├── leads/                ← Lead pipeline (kanban/list)
  │   │   │   ├── schools/              ← Assigned schools
  │   │   │   └── visits/               ← Visit log + follow-ups
  │   │   │
  │   │   └── distributor/
  │   │       ├── page.tsx
  │   │       ├── orders/               ← Order management
  │   │       ├── inventory/
  │   │       └── payments/             ← Payments + invoice download
  │   │
  │   └── api/
  │       ├── auth/[...nextauth]/route.ts
  │       ├── admin/
  │       ├── manager/
  │       ├── bdm/
  │       ├── distributor/
  │       └── mobile/v1/                ← REST endpoints for mobile app
  │
  ├── components/
  │   ├── ui/                           ← Button, Input, Modal, Table, Badge
  │   ├── layout/                       ← Sidebar, Header, DashboardLayout
  │   └── charts/                       ← Recharts wrappers
  │
  ├── lib/
  │   ├── prisma.ts                     ← Prisma client singleton
  │   ├── auth.ts                       ← NextAuth config
  │   ├── redis.ts                      ← ioredis client (future)
  │   └── queue.ts                      ← BullMQ setup (future)
  │
  └── middleware.ts                     ← Role-based route protection


--------------------------------------------------------------------------------
6. MOBILE APP STRUCTURE (apps/mobile)
--------------------------------------------------------------------------------

  src/
  ├── app/                              ← Expo Router (file-based routing)
  │   ├── (auth)/login.tsx              ← Shared login screen
  │   │
  │   ├── (teacher)/
  │   │   ├── _layout.tsx               ← Bottom tab navigator
  │   │   ├── index.tsx                 ← Teacher dashboard
  │   │   ├── attendance/               ← Mark + view attendance
  │   │   ├── assignments/              ← Create assignments, view submissions
  │   │   ├── timetable/
  │   │   ├── notices/
  │   │   └── results/                  ← Enter marks
  │   │
  │   ├── (student)/
  │   │   ├── _layout.tsx
  │   │   ├── index.tsx                 ← Student dashboard
  │   │   ├── attendance/               ← My attendance %
  │   │   ├── assignments/              ← Submit assignments
  │   │   ├── results/                  ← My marks / report card
  │   │   ├── timetable/
  │   │   ├── fees/                     ← Fee status + pay online
  │   │   └── notices/
  │   │
  │   └── (parent)/
  │       ├── _layout.tsx
  │       ├── index.tsx                 ← Parent dashboard (multi-child)
  │       ├── children/                 ← Switch between children
  │       ├── attendance/               ← Child attendance view
  │       ├── results/                  ← Child results
  │       ├── fees/                     ← Pay fees (Razorpay SDK)
  │       ├── notices/
  │       └── leave/                    ← Apply for leave
  │
  ├── components/
  │   ├── ui/                           ← Card, Button, Avatar, Badge
  │   └── layout/                       ← TabBar, Header, SafeArea wrapper
  │
  ├── services/
  │   ├── api.ts                        ← Axios instance + interceptors
  │   ├── auth.ts                       ← JWT token (Expo SecureStore)
  │   └── notifications.ts              ← Expo Push + FCM
  │
  └── store/
      └── authStore.ts                  ← Zustand global auth state


--------------------------------------------------------------------------------
7. AUTHENTICATION FLOW
--------------------------------------------------------------------------------

  Web Portal
  ──────────
  • NextAuth.js with CredentialsProvider
  • User submits email + password
  • Server verifies password with bcryptjs
  • JWT token issued with { id, name, email, role }
  • middleware.ts checks role and guards routes:
      /admin/*       → role === ADMIN
      /manager/*     → role === MANAGER
      /bdm/*         → role === BDM
      /distributor/* → role === DISTRIBUTOR

  Mobile App
  ──────────
  • POST /api/mobile/v1/auth/login
  • Receives accessToken (15min) + refreshToken (30 days)
  • Tokens stored in Expo SecureStore
  • Axios interceptor auto-refreshes token on 401
  • Role determines which tab group loads on app start


--------------------------------------------------------------------------------
8. DATABASE SCHEMA (PostgreSQL via Prisma)
--------------------------------------------------------------------------------

  Role Enum
  ──────────
  ADMIN | MANAGER | BDM | DISTRIBUTOR | TEACHER | STUDENT | PARENT

  Core Tables
  ────────────

  User
    id, name, email, phone, password (hashed), role, schoolId?,
    managerId?, isActive, createdAt, updatedAt

  School
    id, name, address, city, state, pincode, phone, status,
    bdmId (FK → User), distributorId (FK → Distributor)

  Student
    id, userId (FK → User), schoolId, classId, rollNo,
    parentId (FK → User), admissionDate

  Attendance
    id, studentId, classId, date, status (PRESENT/ABSENT/LATE),
    markedByTeacherId

  Assignment
    id, title, description, classId, teacherId, dueDate,
    attachmentUrl, createdAt

  AssignmentSubmission
    id, assignmentId, studentId, fileUrl, submittedAt, grade

  Result
    id, studentId, examId, subject, marks, maxMarks, grade

  Fee
    id, studentId, amount, dueDate, paidDate, status,
    transactionId, gateway (RAZORPAY/MANUAL), receiptUrl

  Notice
    id, schoolId, title, body, targetRoles (JSON array),
    publishedAt, attachmentUrl, createdBy

  Lead
    id, schoolId, bdmId, status (NEW/CONTACTED/QUALIFIED/CONVERTED/LOST),
    note, followUpDate, createdAt

  Order
    id, distributorId, schoolId, items (JSON), totalAmount,
    status, paymentStatus, createdAt

  WhatsAppLog
    id, to (phone), templateId, payload (JSON), status,
    sentAt, error?, jobId

  DeviceToken
    id, userId, token, platform (ios/android), updatedAt


--------------------------------------------------------------------------------
9. FUTURE SERVICES
--------------------------------------------------------------------------------

  A. WhatsApp API (Meta Cloud API + DLT)
  ────────────────────────────────────────
  • Register on DLT portal (Vodafone/Airtel) for template approval
  • Use Meta Cloud API REST endpoints
  • Store approved template IDs in DB
  • Trigger events: fee due, attendance alert, result published,
    leave approved, school notice
  • All sends logged in WhatsAppLog table
  • Package: axios (Meta REST API calls)

  B. Payment Gateway (Razorpay)
  ──────────────────────────────
  • npm install razorpay
  • Server creates order → client confirms → webhook verifies
  • Fee table updated on successful payment
  • Mobile uses Razorpay React Native SDK
  • Supports: UPI, cards, net banking, wallets

  C. Job Queue + Scheduler (BullMQ + Redis)
  ──────────────────────────────────────────
  • npm install bullmq ioredis
  • Queues defined:
      whatsappQueue     — WhatsApp message delivery
      emailQueue        — Email notifications
      reportQueue       — Monthly/weekly report generation
      notificationQueue — Push notification dispatch
  • Scheduled jobs (cron):
      Daily 4pm  — Attendance summary to parents
      7 days before due — Fee reminder to parents
      1st of month — Monthly report to managers
      Every night — Sync school data snapshot

  D. Redis (Cache + Session + Rate Limit)
  ────────────────────────────────────────
  • Session store for web portal
  • Cache school list, class lists (TTL 5 min)
  • Rate limiting on API endpoints (100 req/min per IP)
  • Pub/Sub for real-time notifications (future)

  E. CDN — File Storage (Cloudflare R2 / AWS S3)
  ─────────────────────────────────────────────────
  • npm install @aws-sdk/client-s3
  • Stores: assignment PDFs, report cards, school photos,
    WhatsApp media, notice attachments
  • Signed URLs for secure file download
  • CDNAsset table tracks all uploads with metadata

  F. Push Notifications (Expo + FCM + APNs)
  ───────────────────────────────────────────
  • expo-notifications + @expo/server
  • DeviceToken table stores per-user tokens
  • Triggered via notificationQueue (BullMQ)
  • Events: new notice, attendance marked, result published,
    fee due, leave status update


--------------------------------------------------------------------------------
10. ENVIRONMENT VARIABLES
--------------------------------------------------------------------------------

  # Database
  DATABASE_URL="postgresql://user:password@localhost:5432/academy_setu"

  # Auth
  NEXTAUTH_SECRET="your-secret-here"
  NEXTAUTH_URL="http://localhost:3000"
  JWT_REFRESH_SECRET="your-refresh-secret"

  # Redis (future)
  REDIS_URL="redis://localhost:6379"

  # Razorpay (future)
  RAZORPAY_KEY_ID="rzp_test_xxxxx"
  RAZORPAY_KEY_SECRET="xxxxx"

  # WhatsApp Meta API (future)
  WHATSAPP_TOKEN="EAAxxxxx"
  WHATSAPP_PHONE_ID="1234567890"
  WHATSAPP_BUSINESS_ID="0987654321"

  # CDN / S3 (future)
  S3_BUCKET="academy-setu-assets"
  S3_REGION="ap-south-1"
  AWS_ACCESS_KEY_ID="xxxxx"
  AWS_SECRET_ACCESS_KEY="xxxxx"


--------------------------------------------------------------------------------
11. SETUP & COMMANDS
--------------------------------------------------------------------------------

  # 1. Clone & install
  git clone https://github.com/your-org/academy-setu
  cd academy-setu
  npm install

  # 2. Set up environment
  cp .env.example .env
  # Fill in DATABASE_URL, NEXTAUTH_SECRET, etc.

  # 3. Database setup
  npx prisma db push          # Create tables from schema
  npx prisma db seed          # Seed admin user + sample data
  npx prisma studio           # Optional: visual DB browser

  # 4. Run web portal
  cd apps/web
  npm run dev                 # http://localhost:3000

  # 5. Run mobile app
  cd apps/mobile
  npx expo start              # Scan QR with Expo Go app

  # 6. Build for production (web)
  npm run build
  npm run start


--------------------------------------------------------------------------------
12. DEFAULT ROUTES AFTER LOGIN
--------------------------------------------------------------------------------

  Admin       →  /admin/dashboard
  Manager     →  /manager/dashboard
  BDM         →  /bdm/dashboard
  Distributor →  /distributor/dashboard
  Teacher     →  Mobile: Teacher tab group
  Student     →  Mobile: Student tab group
  Parent      →  Mobile: Parent tab group


--------------------------------------------------------------------------------
END OF DOCUMENT
Academy Setu — School Portal | Version 1.0 | June 2025
================================================================================
