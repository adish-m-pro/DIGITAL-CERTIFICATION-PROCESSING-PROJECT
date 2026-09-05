import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';
import { createAuditLog } from '../services/auditService.js';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_academic_document_system_2026';

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide email/ID and password' });
      return;
    }

    // Lookup user by email or by student ID / faculty code
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { studentProfile: { studentIdNumber: email.toUpperCase().trim() } },
          { facultyProfile: { facultyCode: email.toUpperCase().trim() } }
        ]
      },
      include: {
        studentProfile: {
          include: {
            department: true,
            course: true,
            advisor: { include: { user: true } }
          }
        },
        facultyProfile: {
          include: { department: true }
        }
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials or user not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials or incorrect password' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ error: 'Account is deactivated. Contact Administrator.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await createAuditLog(user.id, null, `User ${user.email} logged in (${user.role})`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        studentProfile: user.studentProfile,
        facultyProfile: user.facultyProfile
      }
    });
  } catch (err: any) {
    console.error('Login error', err);
    res.status(500).json({ error: 'An error occurred during authentication' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// GET /api/auth/academic-meta (Public metadata: departments, courses, faculty advisors for registration)
authRouter.get('/academic-meta', async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        courses: true,
        faculty: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });
    res.json(departments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch academic metadata' });
  }
});

// POST /api/auth/register (Real Student/Faculty Self-Registration stored in DB)
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      departmentId,
      courseId,
      studentIdNumber,
      currentYear,
      currentSemester,
      academicBatch,
      phone,
      advisorId,
      designation
    } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      res.status(400).json({ error: 'An account with this email address is already registered in the system.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'FACULTY' ? 'FACULTY' : 'STUDENT'; // default self-registration to STUDENT or FACULTY

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        status: 'ACTIVE'
      }
    });

    if (assignedRole === 'STUDENT') {
      const generatedIdNumber = studentIdNumber ? studentIdNumber.toUpperCase().trim() : `STU${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Check if student ID taken
      const existingId = await prisma.student.findUnique({ where: { studentIdNumber: generatedIdNumber } });
      const finalIdNumber = existingId ? `${generatedIdNumber}-${Math.floor(10 + Math.random() * 89)}` : generatedIdNumber;

      let validDeptId = departmentId;
      let validCourseId = courseId;

      if (!validDeptId) {
        const defaultDept = await prisma.department.findFirst();
        validDeptId = defaultDept?.id;
      }

      if (!validCourseId && validDeptId) {
        const defaultCourse = await prisma.course.findFirst({ where: { departmentId: validDeptId } });
        validCourseId = defaultCourse?.id;
      }

      await prisma.student.create({
        data: {
          userId: user.id,
          studentIdNumber: finalIdNumber,
          departmentId: validDeptId,
          courseId: validCourseId,
          currentYear: parseInt(currentYear) || 1,
          currentSemester: parseInt(currentSemester) || 1,
          academicBatch: academicBatch || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
          phone: phone || null,
          advisorId: advisorId || null,
          cgpa: 8.5
        }
      });
    } else if (assignedRole === 'FACULTY') {
      let validDeptId = departmentId;
      if (!validDeptId) {
        const defaultDept = await prisma.department.findFirst();
        validDeptId = defaultDept?.id;
      }

      const facultyCount = await prisma.faculty.count();
      const code = `FAC-${(validDeptId || 'GEN').substring(0, 3).toUpperCase()}-${facultyCount + 101}`;

      await prisma.faculty.create({
        data: {
          userId: user.id,
          facultyCode: code,
          departmentId: validDeptId,
          designation: designation || 'Assistant Professor'
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await createAuditLog(user.id, null, `New user ${user.email} registered (${user.role})`);

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        studentProfile: { include: { department: true, course: true, advisor: { include: { user: true } } } },
        facultyProfile: { include: { department: true } }
      }
    });

    res.status(201).json({
      message: 'Account registered successfully!',
      token,
      user: {
        id: fullUser!.id,
        email: fullUser!.email,
        name: fullUser!.name,
        role: fullUser!.role,
        status: fullUser!.status,
        studentProfile: fullUser!.studentProfile,
        facultyProfile: fullUser!.facultyProfile
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// POST /api/auth/forgot-password (mock/helper for UI)
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  res.json({
    message: 'If an account exists with this email, password reset instructions have been dispatched.'
  });
});

