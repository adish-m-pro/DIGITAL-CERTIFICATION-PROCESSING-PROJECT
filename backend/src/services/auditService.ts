import { prisma } from '../config/db.js';

export async function createNotification(userId: string, title: string, message: string, type = 'INFO', link?: string) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link
      }
    });
  } catch (err) {
    console.error('Failed to create notification', err);
  }
}

export async function createAuditLog(userId: string | null, requestId: string | null, action: string, metadata?: any, ipAddress?: string) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        requestId,
        action,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress
      }
    });
  } catch (err) {
    console.error('Failed to create audit log', err);
  }
}
