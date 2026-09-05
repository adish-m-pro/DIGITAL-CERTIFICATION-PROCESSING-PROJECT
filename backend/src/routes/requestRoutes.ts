import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/db.js';
import { authenticateJWT, AuthRequest, requireRoles } from '../middleware/auth.js';
import { processWorkflowTransition } from '../services/workflowService.js';
import { generateAcademicPDF } from '../services/documentGenerator.js';
import { createNotification, createAuditLog } from '../services/auditService.js';

export const requestRouter = Router();

// Multer storage setup for attachments
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, JPG, and DOCX allowed.'));
    }
  }
});

// GET /api/requests - List requests based on user role & permissions
requestRouter.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status, documentTypeId, search, departmentId } = req.query;

    const where: any = {};

    // Filter by status if provided
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    // Filter by document type
    if (documentTypeId && typeof documentTypeId === 'string' && documentTypeId !== 'ALL') {
      where.documentTypeId = documentTypeId;
    }

    // Role-based scoping
    if (user.role === 'STUDENT') {
      if (!user.studentProfile) {
        res.status(400).json({ error: 'Student profile not found' });
        return;
      }
      where.studentId = user.studentProfile.id;
    } else if (user.role === 'FACULTY') {
      if (!user.facultyProfile) {
        res.status(400).json({ error: 'Faculty profile not found' });
        return;
      }
      // Faculty views requests from students assigned to them or in their department under faculty review
      where.departmentId = user.facultyProfile.departmentId;
    } else if (user.role === 'HOD') {
      // HOD sees requests from their department
      const dept = await prisma.department.findFirst({ where: { hodId: user.id } });
      if (dept) {
        where.departmentId = dept.id;
      }
    } else if (user.role === 'OFFICE') {
      // Academic Office sees all requests across departments
      if (departmentId && departmentId !== 'ALL') {
        where.departmentId = departmentId;
      }
    } else if (user.role === 'ADMIN') {
      if (departmentId && departmentId !== 'ALL') {
        where.departmentId = departmentId;
      }
    }

    // Search query
    if (search && typeof search === 'string' && search.trim() !== '') {
      const s = search.trim();
      where.OR = [
        { requestNumber: { contains: s } },
        { purpose: { contains: s } },
        { student: { studentIdNumber: { contains: s } } },
        { student: { user: { name: { contains: s } } } },
        { documentType: { name: { contains: s } } }
      ];
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        documentType: true,
        department: true,
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            course: true,
            department: true,
            advisor: { include: { user: { select: { name: true, email: true } } } }
          }
        },
        attachments: true,
        generatedDocument: true,
        approvals: {
          include: {
            approver: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (err: any) {
    console.error('Fetch requests error', err);
    res.status(500).json({ error: 'Failed to retrieve requests' });
  }
});

// GET /api/requests/:id - Single request details with timeline & attachments
requestRouter.get('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        documentType: {
          include: {
            workflows: { orderBy: { stageOrder: 'asc' } }
          }
        },
        department: true,
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            course: true,
            department: true,
            advisor: { include: { user: { select: { name: true, email: true } } } }
          }
        },
        attachments: true,
        generatedDocument: true,
        approvals: {
          include: {
            approver: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        auditLogs: {
          include: {
            user: { select: { id: true, name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!request) {
      res.status(404).json({ error: 'Document request not found' });
      return;
    }

    // Security check: Student can only view their own
    if (user.role === 'STUDENT' && request.student.user.id !== user.id) {
      res.status(403).json({ error: 'You do not have permission to view this request.' });
      return;
    }

    res.json(request);
  } catch (err: any) {
    console.error('Fetch single request error', err);
    res.status(500).json({ error: 'Failed to retrieve request details' });
  }
});

// POST /api/requests - Create a new document request
requestRouter.post(
  '/',
  authenticateJWT,
  requireRoles(['STUDENT', 'ADMIN']),
  upload.array('attachments', 5),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { documentTypeId, purpose, requiredDate, additionalRemarks } = req.body;

      if (!documentTypeId || !purpose) {
        res.status(400).json({ error: 'Document type and purpose are required fields.' });
        return;
      }

      let studentId = '';
      let departmentId = '';

      if (user.role === 'STUDENT') {
        if (!user.studentProfile) {
          res.status(400).json({ error: 'Student academic profile not found.' });
          return;
        }
        studentId = user.studentProfile.id;
        departmentId = user.studentProfile.departmentId;
      } else {
        // Admin initiating on behalf of a student
        if (!req.body.studentId) {
          res.status(400).json({ error: 'Student ID is required when created by admin.' });
          return;
        }
        const stu = await prisma.student.findUnique({ where: { id: req.body.studentId } });
        if (!stu) {
          res.status(404).json({ error: 'Student record not found.' });
          return;
        }
        studentId = stu.id;
        departmentId = stu.departmentId;
      }

      const docType = await prisma.documentType.findUnique({
        where: { id: documentTypeId },
        include: { workflows: { orderBy: { stageOrder: 'asc' } } }
      });

      if (!docType) {
        res.status(404).json({ error: 'Invalid document type selected.' });
        return;
      }

      // Generate sequence number
      const count = await prisma.request.count();
      const currentYear = new Date().getFullYear();
      const requestNumber = `REQ-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      // Determine initial status based on first stage in workflow
      const firstStage = docType.workflows[0];
      let initialStatus = 'SUBMITTED';
      if (firstStage) {
        if (firstStage.roleRequired === 'FACULTY') initialStatus = 'UNDER_FACULTY_REVIEW';
        else if (firstStage.roleRequired === 'HOD') initialStatus = 'UNDER_HOD_REVIEW';
        else if (firstStage.roleRequired === 'OFFICE') initialStatus = 'UNDER_OFFICE_PROCESSING';
      }

      const newRequest = await prisma.request.create({
        data: {
          requestNumber,
          studentId,
          departmentId,
          documentTypeId,
          purpose,
          requiredDate: requiredDate ? new Date(requiredDate) : null,
          additionalRemarks: additionalRemarks || null,
          status: initialStatus,
          currentStageOrder: firstStage ? firstStage.stageOrder : 1
        }
      });

      // Save attachments if uploaded
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (const file of files) {
          await prisma.requestAttachment.create({
            data: {
              requestId: newRequest.id,
              fileName: file.filename,
              fileOriginalName: file.originalname,
              filePath: `/uploads/${file.filename}`,
              fileType: file.mimetype,
              fileSize: file.size
            }
          });
        }
      }

      // Notification to student
      await createNotification(
        user.id,
        'Request Submitted Successfully',
        `Your request for ${docType.name} (${requestNumber}) has been submitted and is currently ${initialStatus.replace(/_/g, ' ')}.`,
        'INFO',
        `/student/requests/${newRequest.id}`
      );

      // Audit Log
      await createAuditLog(
        user.id,
        newRequest.id,
        `Student ${user.name} submitted request ${requestNumber} for ${docType.name}`
      );

      res.status(201).json({
        message: 'Request submitted successfully.',
        request: newRequest
      });
    } catch (err: any) {
      console.error('Create request error', err);
      res.status(500).json({ error: 'Failed to create request: ' + err.message });
    }
  }
);

// POST /api/requests/:id/approve - Approve workflow step
requestRouter.post(
  '/:id/approve',
  authenticateJWT,
  requireRoles(['FACULTY', 'HOD', 'OFFICE', 'ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { remarks } = req.body;

      const updated = await processWorkflowTransition(id, user.id, 'APPROVED', remarks);
      res.json({ message: 'Request approved successfully', request: updated });
    } catch (err: any) {
      console.error('Approval error', err);
      res.status(400).json({ error: err.message || 'Approval failed' });
    }
  }
);

// POST /api/requests/:id/reject - Reject workflow step
requestRouter.post(
  '/:id/reject',
  authenticateJWT,
  requireRoles(['FACULTY', 'HOD', 'OFFICE', 'ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { remarks } = req.body;

      if (!remarks || remarks.trim() === '') {
        res.status(400).json({ error: 'Please enter a reason for rejecting the request.' });
        return;
      }

      const updated = await processWorkflowTransition(id, user.id, 'REJECTED', remarks);
      res.json({ message: 'Request rejected', request: updated });
    } catch (err: any) {
      console.error('Reject error', err);
      res.status(400).json({ error: err.message || 'Rejection failed' });
    }
  }
);

// POST /api/requests/:id/correction - Send back for correction
requestRouter.post(
  '/:id/correction',
  authenticateJWT,
  requireRoles(['FACULTY', 'HOD', 'OFFICE', 'ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { remarks } = req.body;

      if (!remarks || remarks.trim() === '') {
        res.status(400).json({ error: 'Please enter instructions on what needs correction.' });
        return;
      }

      const updated = await processWorkflowTransition(id, user.id, 'CORRECTION_REQUESTED', remarks);
      res.json({ message: 'Correction requested successfully', request: updated });
    } catch (err: any) {
      console.error('Correction request error', err);
      res.status(400).json({ error: err.message || 'Action failed' });
    }
  }
);

// POST /api/requests/:id/resubmit - Student resubmits after correction
requestRouter.post(
  '/:id/resubmit',
  authenticateJWT,
  requireRoles(['STUDENT']),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { additionalRemarks, purpose } = req.body;

      const request = await prisma.request.findUnique({
        where: { id },
        include: { documentType: { include: { workflows: { orderBy: { stageOrder: 'asc' } } } } }
      });

      if (!request) {
        res.status(404).json({ error: 'Request not found' });
        return;
      }

      const firstStage = request.documentType.workflows[0];
      let resubmitStatus = 'UNDER_FACULTY_REVIEW';
      if (firstStage) {
        if (firstStage.roleRequired === 'FACULTY') resubmitStatus = 'UNDER_FACULTY_REVIEW';
        else if (firstStage.roleRequired === 'HOD') resubmitStatus = 'UNDER_HOD_REVIEW';
        else resubmitStatus = 'UNDER_OFFICE_PROCESSING';
      }

      const updated = await prisma.request.update({
        where: { id },
        data: {
          status: resubmitStatus,
          purpose: purpose || request.purpose,
          additionalRemarks: additionalRemarks || request.additionalRemarks,
          correctionRemarks: null,
          currentStageOrder: firstStage ? firstStage.stageOrder : 1
        }
      });

      await prisma.approvalHistory.create({
        data: {
          requestId: request.id,
          approverId: user.id,
          stageOrder: 0,
          stageName: 'Resubmitted by Student',
          role: 'STUDENT',
          action: 'RESUBMITTED',
          remarks: additionalRemarks || 'Student updated details and resubmitted'
        }
      });

      await createAuditLog(
        user.id,
        request.id,
        `Student ${user.name} resubmitted request ${request.requestNumber}`
      );

      res.json({ message: 'Request resubmitted successfully', request: updated });
    } catch (err: any) {
      console.error('Resubmit error', err);
      res.status(500).json({ error: 'Failed to resubmit request' });
    }
  }
);

// POST /api/requests/:id/generate - Academic Office generates PDF
requestRouter.post(
  '/:id/generate',
  authenticateJWT,
  requireRoles(['OFFICE', 'ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;

      const generatedDoc = await generateAcademicPDF(id, user.id);
      res.json({
        message: 'Document generated and verified successfully!',
        document: generatedDoc
      });
    } catch (err: any) {
      console.error('Document generation error', err);
      res.status(500).json({ error: 'Failed to generate document: ' + err.message });
    }
  }
);
