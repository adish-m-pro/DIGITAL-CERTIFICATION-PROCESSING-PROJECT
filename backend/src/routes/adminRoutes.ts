import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { authenticateJWT, AuthRequest, requireRoles } from '../middleware/auth.js';
import { createAuditLog } from '../services/auditService.js';

export const adminRouter = Router();

// Require ADMIN role for all routes in this router
adminRouter.use(authenticateJWT, requireRoles(['ADMIN']));

// GET /api/admin/stats - System statistics for Admin Dashboard
adminRouter.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const totalStudents = await prisma.student.count();
    const totalFaculty = await prisma.faculty.count();
    const totalRequests = await prisma.request.count();
    
    const pendingRequests = await prisma.request.count({
      where: {
        status: {
          in: ['SUBMITTED', 'UNDER_FACULTY_REVIEW', 'UNDER_HOD_REVIEW', 'UNDER_OFFICE_PROCESSING']
        }
      }
    });

    const completedDocuments = await prisma.request.count({
      where: {
        status: { in: ['READY_FOR_DOWNLOAD', 'COMPLETED'] }
      }
    });

    const rejectedRequests = await prisma.request.count({
      where: {
        status: { in: ['FACULTY_REJECTED', 'HOD_REJECTED', 'CANCELLED'] }
      }
    });

    // Requests by Document Type
    const docTypes = await prisma.documentType.findMany({
      include: {
        _count: { select: { requests: true } }
      }
    });

    // Requests by Department
    const depts = await prisma.department.findMany({
      include: {
        _count: { select: { requests: true, students: true, faculty: true } }
      }
    });

    res.json({
      overview: {
        totalStudents,
        totalFaculty,
        totalRequests,
        pendingRequests,
        completedDocuments,
        rejectedRequests
      },
      byDocType: docTypes.map(d => ({ name: d.name, code: d.code, count: d._count.requests })),
      byDepartment: depts.map(d => ({
        name: d.name,
        code: d.code,
        requestsCount: d._count.requests,
        studentsCount: d._count.students,
        facultyCount: d._count.faculty
      }))
    });
  } catch (err: any) {
    console.error('Admin stats error', err);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Users Management
adminRouter.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        studentProfile: { include: { department: true, course: true } },
        facultyProfile: { include: { department: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

adminRouter.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, departmentId, studentIdNumber, courseId, designation } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Name, email, password, and role are required' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'Email is already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        status: 'ACTIVE'
      }
    });

    if (role === 'STUDENT' && departmentId && courseId && studentIdNumber) {
      await prisma.student.create({
        data: {
          userId: user.id,
          studentIdNumber,
          departmentId,
          courseId,
          academicBatch: `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
          currentYear: 1,
          currentSemester: 1
        }
      });
    } else if (role === 'FACULTY' && departmentId) {
      const fCount = await prisma.faculty.count();
      await prisma.faculty.create({
        data: {
          userId: user.id,
          facultyCode: `FAC-${departmentId.substring(0, 3).toUpperCase()}-${fCount + 1}`,
          departmentId,
          designation: designation || 'Assistant Professor'
        }
      });
    }

    await createAuditLog(req.user!.id, null, `Admin created user ${user.email} with role ${user.role}`);

    res.status(201).json({ message: 'User created successfully', user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create user: ' + err.message });
  }
});

// Update User Status
adminRouter.patch('/users/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: { status }
    });
    res.json({ message: 'User status updated', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Departments Management
adminRouter.get('/departments', async (req: AuthRequest, res: Response) => {
  try {
    const depts = await prisma.department.findMany({
      include: {
        hod: { select: { id: true, name: true, email: true } },
        courses: true,
        _count: { select: { students: true, faculty: true } }
      }
    });
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

adminRouter.post('/departments', async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, hodId } = req.body;
    const dept = await prisma.department.create({
      data: { name, code: code.toUpperCase(), description, hodId }
    });
    res.status(201).json(dept);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Document Types & Dynamic Workflow Management
adminRouter.get('/document-types', async (req: AuthRequest, res: Response) => {
  try {
    const docTypes = await prisma.documentType.findMany({
      include: {
        workflows: { orderBy: { stageOrder: 'asc' } },
        _count: { select: { requests: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(docTypes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch document types' });
  }
});

adminRouter.post('/document-types', async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, estimatedDays, icon, requiresUpload, uploadDocLabel, workflows } = req.body;

    const docType = await prisma.documentType.create({
      data: {
        name,
        code: code.toUpperCase().trim(),
        description,
        estimatedDays: parseInt(estimatedDays) || 3,
        icon: icon || 'FileText',
        requiresUpload: Boolean(requiresUpload),
        uploadDocLabel,
        workflows: {
          create: (workflows || []).map((w: any, index: number) => ({
            stageOrder: index + 1,
            stageName: w.stageName,
            roleRequired: w.roleRequired,
            description: w.description
          }))
        }
      },
      include: { workflows: true }
    });

    res.status(201).json(docType);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.put('/document-types/:id/workflows', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { workflows } = req.body; // Array of { stageName, roleRequired, description }

    // Delete existing stages and recreate
    await prisma.workflowStage.deleteMany({ where: { documentTypeId: id } });

    for (let i = 0; i < workflows.length; i++) {
      const w = workflows[i];
      await prisma.workflowStage.create({
        data: {
          documentTypeId: id,
          stageOrder: i + 1,
          stageName: w.stageName,
          roleRequired: w.roleRequired,
          description: w.description
        }
      });
    }

    const updated = await prisma.documentType.findUnique({
      where: { id },
      include: { workflows: { orderBy: { stageOrder: 'asc' } } }
    });

    await createAuditLog(req.user!.id, null, `Admin updated workflow for document type ${updated?.name}`);

    res.json({ message: 'Workflow stages updated successfully', docType: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update workflow: ' + err.message });
  }
});

// Audit Logs
adminRouter.get('/audit-logs', async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        request: { select: { id: true, requestNumber: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});
