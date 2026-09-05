# 🎓 Digital Academic Document Workflow System (CertiFlow)

A production-style, role-based university academic document request, multi-tier approval workflow, tamper-proof PDF generation, and public QR verification platform.

---

## 🌟 Key Features

1. **Role-Based Workflows**:
   - **Student**: Submit applications for Bonafide Certificates, Official Transcripts, Recommendation Letters, and Course Completion Certificates. Monitor live stage progression and download verified PDFs.
   - **Faculty / Class Advisor**: Review student eligibility, attendance, and CGPA; approve, reject, or request corrections.
   - **Head of Department (HOD)**: Departmental executive sign-off and recommendation.
   - **Academic Office / Document Officer**: Process approved queues, trigger server-side PDF generation with digital signature seals, and issue documents.
   - **University Administrator**: Telemetry analytics, user account provisioning, department management, dynamic workflow stage hierarchy configuration, and tamper-proof audit log explorer.

2. **Automated Cryptographic Document Engine & QR Verification**:
   - Real server-side PDF document synthesis using `pdfkit`.
   - Embedded scannable QR codes pointing to the public verification endpoint (`/verify/:verificationCode`).
   - Tamper-proof security hashes and institutional stamps.

3. **Dynamic Workflow State Machine**:
   - Workflows are defined per Document Type in the database and can be reconfigured dynamically by the Administrator.

4. **Live Quick-Demo Role Switcher**:
   - Seamlessly switch between **STUDENT**, **FACULTY**, **HOD**, **OFFICE**, and **ADMIN** personas with one click from the top demo bar or login screen.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)

### Setup & Run
Run the backend and frontend concurrently:

```bash
# 1. Backend Setup & Database Seed
cd backend
npm install
npx prisma db push
npx tsx prisma/seed.ts
node --import tsx src/index.ts

# 2. Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and backend API at `http://localhost:5000`.

---

## 👥 Demo Accounts (Password: `password123`)

| Role | Email | Purpose |
|---|---|---|
| **Student** | `student@college.edu` | Aditya Verma (STU2023001) - Request & Download Documents |
| **Faculty** | `faculty@college.edu` | Dr. Priya Sharma - Class Advisor & 1st Stage Reviewer |
| **HOD** | `hod@college.edu` | Prof. Rajesh Kumar - CSE Head of Department |
| **Academic Office** | `office@college.edu` | Ms. Eleanor Vance - Document Officer & PDF Generator |
| **Administrator** | `admin@college.edu` | Dr. Arthur Sterling - Workflow & System Governance |
