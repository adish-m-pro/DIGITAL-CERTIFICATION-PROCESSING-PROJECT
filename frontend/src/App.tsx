import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { VerificationPage } from './pages/VerificationPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { RequestDocumentPage } from './pages/student/RequestDocumentPage';
import { MyRequestsPage } from './pages/student/MyRequestsPage';
import { RequestDetailsPage } from './pages/student/RequestDetailsPage';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';

// HOD Pages
import { HodDashboard } from './pages/hod/HodDashboard';

// Academic Office Pages
import { OfficeDashboard } from './pages/office/OfficeDashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { WorkflowConfigPage } from './pages/admin/WorkflowConfigPage';
import { UsersManagementPage } from './pages/admin/UsersManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/verify/:verificationCode" element={<VerificationPage />} />

          {/* Student Protected Routes */}
          <Route element={<AppLayout allowedRoles={['STUDENT', 'ADMIN']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/request" element={<RequestDocumentPage />} />
            <Route path="/student/my-requests" element={<MyRequestsPage />} />
            <Route path="/student/requests/:id" element={<RequestDetailsPage />} />
          </Route>

          {/* Faculty Protected Routes */}
          <Route element={<AppLayout allowedRoles={['FACULTY', 'ADMIN']} />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          </Route>

          {/* HOD Protected Routes */}
          <Route element={<AppLayout allowedRoles={['HOD', 'ADMIN']} />}>
            <Route path="/hod/dashboard" element={<HodDashboard />} />
          </Route>

          {/* Office Protected Routes */}
          <Route element={<AppLayout allowedRoles={['OFFICE', 'ADMIN']} />}>
            <Route path="/office/dashboard" element={<OfficeDashboard />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AppLayout allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/workflows" element={<WorkflowConfigPage />} />
            <Route path="/admin/users" element={<UsersManagementPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
