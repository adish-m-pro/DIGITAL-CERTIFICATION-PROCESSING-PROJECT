import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { authRouter } from './routes/authRoutes.js';
import { requestRouter } from './routes/requestRoutes.js';
import { documentRouter } from './routes/documentRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads and generated documents
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/generated-docs', express.static(path.join(process.cwd(), 'generated-docs')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/requests', requestRouter);
app.use('/api/documents', documentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);

// Base Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Digital Academic Document Workflow System API',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Academic Workflow Server running at http://localhost:${PORT}`);
});
