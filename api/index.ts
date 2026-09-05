import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { authRouter } from '../backend/src/routes/authRoutes.js';
import { requestRouter } from '../backend/src/routes/requestRoutes.js';
import { documentRouter } from '../backend/src/routes/documentRoutes.js';
import { adminRouter } from '../backend/src/routes/adminRoutes.js';
import { notificationRouter } from '../backend/src/routes/notificationRoutes.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static generated docs and uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/generated-docs', express.static(path.join(process.cwd(), 'generated-docs')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/requests', requestRouter);
app.use('/api/documents', documentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Digital Academic Document Workflow System API (Vercel Serverless)',
    timestamp: new Date().toISOString(),
  });
});

export default app;
