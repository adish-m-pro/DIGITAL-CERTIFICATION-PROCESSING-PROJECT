import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { authRouter } from './src/routes/authRoutes.js';
import { requestRouter } from './src/routes/requestRoutes.js';
import { documentRouter } from './src/routes/documentRoutes.js';
import { adminRouter } from './src/routes/adminRoutes.js';
import { notificationRouter } from './src/routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Digital Academic Document Workflow System API',
    timestamp: new Date().toISOString(),
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Academic Workflow Server running at http://localhost:${PORT}`);
  });
}

export default app;
