export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN';
  status: string;
  avatarUrl?: string;
  studentProfile?: StudentProfile;
  facultyProfile?: FacultyProfile;
}

export interface StudentProfile {
  id: string;
  studentIdNumber: string;
  departmentId: string;
  department: { id: string; name: string; code: string };
  courseId: string;
  course: { id: string; name: string; code: string };
  currentYear: number;
  currentSemester: number;
  academicBatch: string;
  phone?: string;
  cgpa: number;
  advisor?: { id: string; user: { name: string; email: string } };
}

export interface FacultyProfile {
  id: string;
  facultyCode: string;
  departmentId: string;
  department: { id: string; name: string; code: string };
  designation: string;
}

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description: string;
  estimatedDays: number;
  icon: string;
  requiresUpload: boolean;
  uploadDocLabel?: string;
  isActive: boolean;
  workflows?: WorkflowStage[];
}

export interface WorkflowStage {
  id: string;
  documentTypeId: string;
  stageOrder: number;
  stageName: string;
  roleRequired: string;
  description?: string;
}

export interface RequestItem {
  id: string;
  requestNumber: string;
  studentId: string;
  student: {
    id: string;
    studentIdNumber: string;
    currentYear: number;
    currentSemester: number;
    academicBatch: string;
    cgpa: number;
    phone?: string;
    user: { id: string; name: string; email: string };
    department: { id: string; name: string; code: string };
    course: { id: string; name: string; code: string };
    advisor?: { id: string; user: { name: string; email: string } };
  };
  departmentId: string;
  department: { id: string; name: string; code: string };
  documentTypeId: string;
  documentType: DocumentType;
  purpose: string;
  requiredDate?: string;
  additionalRemarks?: string;
  status: RequestStatus;
  currentStageOrder: number;
  rejectionReason?: string;
  correctionRemarks?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: RequestAttachment[];
  approvals?: ApprovalHistory[];
  generatedDocument?: GeneratedDocument;
}

export type RequestStatus =
  | 'SUBMITTED'
  | 'UNDER_FACULTY_REVIEW'
  | 'FACULTY_APPROVED'
  | 'FACULTY_REJECTED'
  | 'UNDER_HOD_REVIEW'
  | 'HOD_APPROVED'
  | 'HOD_REJECTED'
  | 'UNDER_OFFICE_PROCESSING'
  | 'DOCUMENT_GENERATED'
  | 'READY_FOR_DOWNLOAD'
  | 'COMPLETED'
  | 'CORRECTION_REQUIRED'
  | 'CANCELLED';

export interface RequestAttachment {
  id: string;
  requestId: string;
  fileName: string;
  fileOriginalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ApprovalHistory {
  id: string;
  requestId: string;
  approverId: string;
  approver: { id: string; name: string; email: string; role: string };
  stageOrder: number;
  stageName: string;
  role: string;
  action: string;
  remarks?: string;
  createdAt: string;
}

export interface GeneratedDocument {
  id: string;
  requestId: string;
  documentNumber: string;
  verificationCode: string;
  filePath: string;
  fileUrl: string;
  fileSize?: number;
  generatedByRole: string;
  generatedAt: string;
  downloadCount: number;
  lastDownloadedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link?: string;
  readStatus: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  user?: { id: string; name: string; email: string; role: string };
  requestId?: string;
  request?: { id: string; requestNumber: string };
  action: string;
  ipAddress?: string;
  metadata?: string;
  createdAt: string;
}
