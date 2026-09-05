import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateJWT, AuthRequest, requireRoles } from '../middleware/auth.js';
import { createAuditLog } from '../services/auditService.js';

export const documentRouter = Router();

// GET /api/documents/verify/:verificationCode - Public Verification Portal (No Auth required)
documentRouter.get('/verify/:verificationCode', async (req: Request, res: Response) => {
  try {
    const { verificationCode } = req.params;

    const doc = await prisma.generatedDocument.findUnique({
      where: { verificationCode },
      include: {
        request: {
          include: {
            documentType: true,
            department: true,
            student: {
              include: {
                user: { select: { name: true } },
                course: true,
                department: true
              }
            }
          }
        }
      }
    });

    if (!doc) {
      res.status(404).json({
        valid: false,
        error: 'Academic document record not found. Please verify the QR code or reference ID.'
      });
      return;
    }

    res.json({
      valid: true,
      documentNumber: doc.documentNumber,
      verificationCode: doc.verificationCode,
      documentType: doc.request.documentType.name,
      documentCode: doc.request.documentType.code,
      studentName: doc.request.student.user.name,
      studentIdNumber: doc.request.student.studentIdNumber,
      department: doc.request.department.name,
      course: doc.request.student.course.name,
      academicBatch: doc.request.student.academicBatch,
      issuedDate: doc.generatedAt,
      issuingAuthority: 'National Institute of Advanced Technology (Office of Academic Affairs)',
      fileUrl: doc.fileUrl,
      status: 'AUTHENTIC & VERIFIED'
    });
  } catch (err: any) {
    console.error('Document verification error', err);
    res.status(500).json({ error: 'Verification service error' });
  }
});

// POST /api/documents/:id/track-download - Increment download count
documentRouter.post('/:id/track-download', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await prisma.generatedDocument.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date()
      },
      include: { request: true }
    });

    await createAuditLog(
      req.user?.id || null,
      doc.requestId,
      `User ${req.user?.name} downloaded document ${doc.documentNumber}`
    );

    res.json({ success: true, downloadCount: doc.downloadCount });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record download' });
  }
});

// GET /api/documents/types - List all active document types with workflows
documentRouter.get('/types', async (req: Request, res: Response) => {
  try {
    const types = await prisma.documentType.findMany({
      where: { isActive: true },
      include: {
        workflows: {
          orderBy: { stageOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(types);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch document types' });
  }
});
