import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';

export const notificationRouter = Router();

// GET /api/notifications
notificationRouter.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
notificationRouter.patch('/:id/read', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notif = await prisma.notification.update({
      where: { id },
      data: { readStatus: true }
    });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// POST /api/notifications/read-all
notificationRouter.post('/read-all', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, readStatus: false },
      data: { readStatus: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});
