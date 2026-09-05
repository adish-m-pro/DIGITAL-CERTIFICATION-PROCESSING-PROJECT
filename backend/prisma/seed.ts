import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding for Academic Document System...');

  // 1. Clear existing records to ensure fresh demo state
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.approvalHistory.deleteMany();
  await prisma.requestAttachment.deleteMany();
  await prisma.generatedDocument.deleteMany();
  await prisma.request.deleteMany();
  await prisma.workflowStage.deleteMany();
  await prisma.documentType.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.course.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Users
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      name: 'Dr. Arthur Sterling',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  // Academic Office Officer
  const officeUser = await prisma.user.create({
    data: {
      email: 'office@college.edu',
      name: 'Ms. Eleanor Vance',
      passwordHash,
      role: 'OFFICE',
      status: 'ACTIVE'
    }
  });

  // HOD CSE
  const hodUser = await prisma.user.create({
    data: {
      email: 'hod@college.edu',
      name: 'Prof. Rajesh Kumar (HOD CSE)',
      passwordHash,
      role: 'HOD',
      status: 'ACTIVE'
    }
  });

  // Faculty / Class Advisor
  const facultyUser = await prisma.user.create({
    data: {
      email: 'faculty@college.edu',
      name: 'Dr. Priya Sharma (Advisor)',
      passwordHash,
      role: 'FACULTY',
      status: 'ACTIVE'
    }
  });

  // Additional Faculty
  const facultyUser2 = await prisma.user.create({
    data: {
      email: 'faculty.it@college.edu',
      name: 'Prof. Amit Verma',
      passwordHash,
      role: 'FACULTY',
      status: 'ACTIVE'
    }
  });

  // Primary Student
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@college.edu',
      name: 'Aditya Verma',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE'
    }
  });

  // Second Student
  const studentUser2 = await prisma.user.create({
    data: {
      email: 'sneha.patel@college.edu',
      name: 'Sneha Patel',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE'
    }
  });

  // Third Student
  const studentUser3 = await prisma.user.create({
    data: {
      email: 'rohit.mehta@college.edu',
      name: 'Rohit Mehta',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE'
    }
  });

  // 3. Create Departments
  const deptCSE = await prisma.department.create({
    data: {
      name: 'Computer Science and Engineering',
      code: 'CSE',
      description: 'Department of Computing, AI, Systems & Software Engineering',
      hodId: hodUser.id
    }
  });

  const deptIT = await prisma.department.create({
    data: {
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Systems, Cloud & Cybersecurity'
    }
  });

  const deptECE = await prisma.department.create({
    data: {
      name: 'Electronics and Communication Engineering',
      code: 'ECE',
      description: 'Department of Embedded Systems, VLSI & Communications'
    }
  });

  const deptMECH = await prisma.department.create({
    data: {
      name: 'Mechanical Engineering',
      code: 'MECH',
      description: 'Department of Thermal, Robotics & Manufacturing Engineering'
    }
  });

  // 4. Create Courses
  const courseBTechCSE = await prisma.course.create({
    data: {
      name: 'B.Tech in Computer Science and Engineering',
      code: 'BTECH-CSE',
      departmentId: deptCSE.id,
      durationYears: 4
    }
  });

  const courseBTechIT = await prisma.course.create({
    data: {
      name: 'B.Tech in Information Technology',
      code: 'BTECH-IT',
      departmentId: deptIT.id,
      durationYears: 4
    }
  });

  const courseBTechECE = await prisma.course.create({
    data: {
      name: 'B.Tech in Electronics & Communication',
      code: 'BTECH-ECE',
      departmentId: deptECE.id,
      durationYears: 4
    }
  });

  // 5. Create Faculty Profiles
  const facultyProfile1 = await prisma.faculty.create({
    data: {
      userId: facultyUser.id,
      facultyCode: 'FAC-CSE-101',
      departmentId: deptCSE.id,
      designation: 'Associate Professor & Class Advisor'
    }
  });

  await prisma.faculty.create({
    data: {
      userId: facultyUser2.id,
      facultyCode: 'FAC-IT-201',
      departmentId: deptIT.id,
      designation: 'Assistant Professor'
    }
  });

  // 6. Create Student Profiles
  const studentProfile1 = await prisma.student.create({
    data: {
      userId: studentUser.id,
      studentIdNumber: 'STU2023001',
      departmentId: deptCSE.id,
      courseId: courseBTechCSE.id,
      currentYear: 3,
      currentSemester: 6,
      academicBatch: '2023-2027',
      phone: '+91 98765 43210',
      cgpa: 8.85,
      advisorId: facultyProfile1.id
    }
  });

  const studentProfile2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      studentIdNumber: 'STU2023045',
      departmentId: deptCSE.id,
      courseId: courseBTechCSE.id,
      currentYear: 3,
      currentSemester: 6,
      academicBatch: '2023-2027',
      phone: '+91 98765 11223',
      cgpa: 9.12,
      advisorId: facultyProfile1.id
    }
  });

  const studentProfile3 = await prisma.student.create({
    data: {
      userId: studentUser3.id,
      studentIdNumber: 'STU2022089',
      departmentId: deptIT.id,
      courseId: courseBTechIT.id,
      currentYear: 4,
      currentSemester: 8,
      academicBatch: '2022-2026',
      phone: '+91 98765 99887',
      cgpa: 7.95
    }
  });

  // 7. Create Document Types & Dynamic Configurable Workflows
  const docTypesData = [
    {
      code: 'BONAFIDE',
      name: 'Bonafide Certificate',
      description: 'Official letter certifying that the student is enrolled and in good academic standing for bank loans, passport, or visa purposes.',
      estimatedDays: 2,
      icon: 'Award',
      requiresUpload: false,
      workflows: [
        { stageOrder: 1, stageName: 'Faculty Advisor Verification', roleRequired: 'FACULTY', description: 'Advisor verifies enrollment & attendance criteria' },
        { stageOrder: 2, stageName: 'Head of Department Approval', roleRequired: 'HOD', description: 'HOD approves the student request' },
        { stageOrder: 3, stageName: 'Academic Office Processing & Issuance', roleRequired: 'OFFICE', description: 'Office generates tamper-proof PDF with QR verification' }
      ]
    },
    {
      code: 'TRANSCRIPT',
      name: 'Official Academic Transcript',
      description: 'Consolidated semester-wise grade sheet, GPA/CGPA scores, and credit breakdown sealed for higher studies applications.',
      estimatedDays: 4,
      icon: 'GraduationCap',
      requiresUpload: true,
      uploadDocLabel: 'Previous Marksheets or Fee Clearance Slip',
      workflows: [
        { stageOrder: 1, stageName: 'Faculty Advisor Review', roleRequired: 'FACULTY', description: 'Verification of course completion records' },
        { stageOrder: 2, stageName: 'HOD Verification', roleRequired: 'HOD', description: 'Verification of departmental credit audit' },
        { stageOrder: 3, stageName: 'Academic Controller Verification & Generation', roleRequired: 'OFFICE', description: 'Office produces digitally signed grade transcript' }
      ]
    },
    {
      code: 'RECOMMENDATION',
      name: 'Letter of Recommendation',
      description: 'Formal academic appraisal and endorsement for internships, master programs, or research fellowships.',
      estimatedDays: 3,
      icon: 'MailCheck',
      requiresUpload: true,
      uploadDocLabel: 'Updated Resume / Statement of Purpose',
      workflows: [
        { stageOrder: 1, stageName: 'Faculty Advisor Assessment & Drafting', roleRequired: 'FACULTY', description: 'Faculty evaluates student merits and academic aptitude' },
        { stageOrder: 2, stageName: 'HOD Endorsement & Completion', roleRequired: 'HOD', description: 'Department head reviews and issues formal endorsement' }
      ]
    },
    {
      code: 'COURSE_COMPLETION',
      name: 'Course Completion Certificate',
      description: 'Attests that the student has completed all academic coursework and practical requirements for the degree.',
      estimatedDays: 5,
      icon: 'BookCheck',
      requiresUpload: true,
      uploadDocLabel: 'Provisional Clearance Slip',
      workflows: [
        { stageOrder: 1, stageName: 'Department Academic Review', roleRequired: 'FACULTY', description: 'Verify coursework completion' },
        { stageOrder: 2, stageName: 'HOD Final Clearance', roleRequired: 'HOD', description: 'HOD signs off on final semester requirements' },
        { stageOrder: 3, stageName: 'Academic Office Document Issuance', roleRequired: 'OFFICE', description: 'Registrar issues formal completion credential' }
      ]
    },
    {
      code: 'NO_DUE',
      name: 'No Due Clearance Certificate',
      description: 'Multi-department clearance stating zero dues from Library, Laboratories, Hostel, and Accounts office.',
      estimatedDays: 3,
      icon: 'ShieldCheck',
      requiresUpload: false,
      workflows: [
        { stageOrder: 1, stageName: 'Faculty Clearance', roleRequired: 'FACULTY', description: 'Class advisor confirms department laboratory dues cleared' },
        { stageOrder: 2, stageName: 'HOD Endorsement', roleRequired: 'HOD', description: 'Department head signs off' },
        { stageOrder: 3, stageName: 'Academic Office Record Clearance', roleRequired: 'OFFICE', description: 'Office verifies overall university clearance' }
      ]
    },
    {
      code: 'CONDUCT',
      name: 'Conduct & Character Certificate',
      description: 'Affirms that the student has maintained disciplined behavior and no disciplinary proceedings are pending.',
      estimatedDays: 2,
      icon: 'BadgeCheck',
      requiresUpload: false,
      workflows: [
        { stageOrder: 1, stageName: 'Class Advisor Verification', roleRequired: 'FACULTY', description: 'Confirm student discipline record' },
        { stageOrder: 2, stageName: 'HOD Approval', roleRequired: 'HOD', description: 'HOD approval for conduct certificate' },
        { stageOrder: 3, stageName: 'Academic Office Generation', roleRequired: 'OFFICE', description: 'Document generation and digital seal' }
      ]
    },
    {
      code: 'STUDY',
      name: 'Study Certificate (Medium of Instruction)',
      description: 'Official letter confirming that the medium of instruction throughout the degree was English.',
      estimatedDays: 2,
      icon: 'Languages',
      requiresUpload: false,
      workflows: [
        { stageOrder: 1, stageName: 'Faculty Advisor Review', roleRequired: 'FACULTY', description: 'Verify medium and program details' },
        { stageOrder: 2, stageName: 'Academic Office Generation', roleRequired: 'OFFICE', description: 'Issuance by Academic Office' }
      ]
    }
  ];

  const createdDocTypes: Record<string, any> = {};

  for (const item of docTypesData) {
    const { workflows, ...docTypeFields } = item;
    const dt = await prisma.documentType.create({
      data: {
        ...docTypeFields,
        workflows: {
          create: workflows.map(w => ({
            stageOrder: w.stageOrder,
            stageName: w.stageName,
            roleRequired: w.roleRequired,
            description: w.description
          }))
        }
      },
      include: { workflows: true }
    });
    createdDocTypes[dt.code] = dt;
  }

  // 8. Create Realistic Demo Requests in various realistic states
  // Request 1: Freshly submitted Bonafide request ready for Faculty Review (Great for testing Demo flow!)
  const req1 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-2026-0001',
      studentId: studentProfile1.id,
      departmentId: deptCSE.id,
      documentTypeId: createdDocTypes['BONAFIDE'].id,
      purpose: 'Application for State Higher Education Tech Scholarship & National Bank Education Loan verification.',
      status: 'UNDER_FACULTY_REVIEW',
      currentStageOrder: 1,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    }
  });

  // Request 2: Transcript request currently approved by Faculty and now waiting for HOD Approval
  const req2 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-2026-0002',
      studentId: studentProfile1.id,
      departmentId: deptCSE.id,
      documentTypeId: createdDocTypes['TRANSCRIPT'].id,
      purpose: 'Applying for Fall 2027 Master in Computer Science graduate programs at university abroad.',
      status: 'UNDER_HOD_REVIEW',
      currentStageOrder: 2,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  });

  // Record faculty approval for REQ-2026-0002
  await prisma.approvalHistory.create({
    data: {
      requestId: req2.id,
      approverId: facultyUser.id,
      stageOrder: 1,
      stageName: 'Faculty Advisor Review',
      role: 'FACULTY',
      action: 'APPROVED',
      remarks: 'Verified completed credit sheets for Semesters 1 to 5. CGPA is accurate (8.85).'
    }
  });

  // Request 3: Recommendation Letter rejected with a clear reason
  const req3 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-2026-0003',
      studentId: studentProfile1.id,
      departmentId: deptCSE.id,
      documentTypeId: createdDocTypes['RECOMMENDATION'].id,
      purpose: 'Summer Research Internship application at Indian Institute of Science.',
      status: 'FACULTY_REJECTED',
      rejectionReason: 'Please attach an updated Statement of Purpose and specific targeted research group details before re-applying.',
      currentStageOrder: 1,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  });

  await prisma.approvalHistory.create({
    data: {
      requestId: req3.id,
      approverId: facultyUser.id,
      stageOrder: 1,
      stageName: 'Faculty Advisor Assessment',
      role: 'FACULTY',
      action: 'REJECTED',
      remarks: 'Please attach an updated Statement of Purpose and specific targeted research group details before re-applying.'
    }
  });

  // Request 4: Completed Bonafide Certificate with full history and generated PDF
  const req4 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-2026-0004',
      studentId: studentProfile1.id,
      departmentId: deptCSE.id,
      documentTypeId: createdDocTypes['BONAFIDE'].id,
      purpose: 'Metro Rail Student Concession Pass renewal and verification.',
      status: 'READY_FOR_DOWNLOAD',
      currentStageOrder: 3,
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000)
    }
  });

  await prisma.approvalHistory.create({
    data: {
      requestId: req4.id,
      approverId: facultyUser.id,
      stageOrder: 1,
      stageName: 'Faculty Advisor Verification',
      role: 'FACULTY',
      action: 'APPROVED',
      remarks: 'Student has > 85% attendance and active student ID.'
    }
  });

  await prisma.approvalHistory.create({
    data: {
      requestId: req4.id,
      approverId: hodUser.id,
      stageOrder: 2,
      stageName: 'Head of Department Approval',
      role: 'HOD',
      action: 'APPROVED',
      remarks: 'Recommended and approved from CSE department.'
    }
  });

  // 9. Initial Notifications for Student
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser.id,
        title: 'Document Ready for Download',
        message: 'Your Bonafide Certificate request REQ-2026-0004 has been approved and generated.',
        type: 'SUCCESS',
        link: `/student/requests/${req4.id}`,
        readStatus: false
      },
      {
        userId: studentUser.id,
        title: 'Faculty Approved Request',
        message: 'Dr. Priya Sharma approved your Transcript request REQ-2026-0002. Now forwarded to HOD.',
        type: 'INFO',
        link: `/student/requests/${req2.id}`,
        readStatus: true
      },
      {
        userId: studentUser.id,
        title: 'Recommendation Letter Status',
        message: 'Your Recommendation Letter request REQ-2026-0003 was reviewed with remarks.',
        type: 'ERROR',
        link: `/student/requests/${req3.id}`,
        readStatus: false
      }
    ]
  });

  // Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: studentUser.id,
        requestId: req1.id,
        action: 'Student Aditya Verma submitted request REQ-2026-0001 for Bonafide Certificate'
      },
      {
        userId: facultyUser.id,
        requestId: req2.id,
        action: 'Faculty Dr. Priya Sharma verified and approved REQ-2026-0002'
      },
      {
        userId: hodUser.id,
        requestId: req4.id,
        action: 'HOD Prof. Rajesh Kumar endorsed and approved REQ-2026-0004'
      }
    ]
  });

  console.log('✅ Seeding completed successfully!');
  console.log('👤 Admin: admin@college.edu / password123');
  console.log('👤 Faculty: faculty@college.edu / password123');
  console.log('👤 HOD: hod@college.edu / password123');
  console.log('👤 Office: office@college.edu / password123');
  console.log('👤 Student: student@college.edu / password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
