import { prisma } from '../config/db.js';
import { createNotification, createAuditLog } from './auditService.js';

export async function processWorkflowTransition(
  requestId: string,
  approverId: string,
  action: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUESTED',
  remarks?: string
) {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      student: { include: { user: true, department: true } },
      documentType: {
        include: {
          workflows: {
            orderBy: { stageOrder: 'asc' }
          }
        }
      }
    }
  });

  if (!request) {
    throw new Error('Request not found');
  }

  const approver = await prisma.user.findUnique({ where: { id: approverId } });
  if (!approver) throw new Error('Approver not found');

  const workflows = request.documentType.workflows;
  const currentStage = workflows.find((w: any) => w.stageOrder === request.currentStageOrder);
  const stageName = currentStage ? currentStage.stageName : 'Workflow Stage';

  // Record Approval History
  await prisma.approvalHistory.create({
    data: {
      requestId: request.id,
      approverId: approver.id,
      stageOrder: request.currentStageOrder,
      stageName,
      role: approver.role,
      action,
      remarks: remarks || null
    }
  });

  // Handle REJECTED
  if (action === 'REJECTED') {
    let finalStatus = 'FACULTY_REJECTED';
    if (approver.role === 'HOD') finalStatus = 'HOD_REJECTED';
    else if (approver.role === 'OFFICE' || approver.role === 'ADMIN') finalStatus = 'CANCELLED';

    const updated = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: finalStatus,
        rejectionReason: remarks || 'Request was rejected by ' + approver.role
      }
    });

    await createNotification(
      request.student.user.id,
      `Request ${request.requestNumber} Rejected`,
      `Your request for ${request.documentType.name} was rejected by ${approver.name} (${approver.role}). Reason: ${remarks || 'No remarks'}`,
      'ERROR',
      `/student/requests/${request.id}`
    );

    await createAuditLog(
      approver.id,
      request.id,
      `${approver.role} ${approver.name} rejected request ${request.requestNumber}`
    );

    return updated;
  }

  // Handle CORRECTION_REQUESTED
  if (action === 'CORRECTION_REQUESTED') {
    const updated = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: 'CORRECTION_REQUIRED',
        correctionRemarks: remarks || 'Please update the requested details/documents.'
      }
    });

    await createNotification(
      request.student.user.id,
      `Correction Required for ${request.requestNumber}`,
      `Your request for ${request.documentType.name} needs correction: "${remarks}"`,
      'WARNING',
      `/student/requests/${request.id}`
    );

    await createAuditLog(
      approver.id,
      request.id,
      `${approver.role} ${approver.name} requested corrections for ${request.requestNumber}`
    );

    return updated;
  }

  // Handle APPROVED -> determine next stage
  const currentStageIndex = workflows.findIndex((w: any) => w.stageOrder === request.currentStageOrder);
  const nextStage = workflows[currentStageIndex + 1];

  let nextStatus = 'COMPLETED';
  let nextStageOrder = request.currentStageOrder;

  if (nextStage) {
    nextStageOrder = nextStage.stageOrder;
    if (nextStage.roleRequired === 'HOD') {
      nextStatus = 'UNDER_HOD_REVIEW';
    } else if (nextStage.roleRequired === 'OFFICE') {
      nextStatus = 'UNDER_OFFICE_PROCESSING';
    } else if (nextStage.roleRequired === 'FACULTY') {
      nextStatus = 'UNDER_FACULTY_REVIEW';
    } else {
      nextStatus = 'UNDER_OFFICE_PROCESSING';
    }
  } else {
    // No more stages -> If it reached the end
    nextStatus = 'READY_FOR_DOWNLOAD';
  }

  const updated = await prisma.request.update({
    where: { id: requestId },
    data: {
      status: nextStatus,
      currentStageOrder: nextStageOrder,
      correctionRemarks: null,
      rejectionReason: null
    }
  });

  // Notify student
  await createNotification(
    request.student.user.id,
    `Request ${request.requestNumber} Progress Update`,
    `Your ${request.documentType.name} request was approved by ${approver.name} (${approver.role}). Status is now: ${nextStatus.replace(/_/g, ' ')}.`,
    'SUCCESS',
    `/student/requests/${request.id}`
  );

  await createAuditLog(
    approver.id,
    request.id,
    `${approver.role} ${approver.name} approved request ${request.requestNumber} (Advanced to stage: ${nextStatus})`
  );

  return updated;
}
