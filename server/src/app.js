import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import lessonsRoutes from './routes/lessons.routes.js';
import enrollmentsRoutes from './routes/enrollments.routes.js';
import progressRoutes from './routes/progress.routes.js';
import quizzesRoutes from './routes/quizzes.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import adminRoutes from './routes/admin.routes.js';
import enrollmentRoutes from './routes/enrollments.routes.js';
import certificatesRoutes from './routes/certificates.routes.js';
dotenv.config();

const app = express();

// ── Security middleware ────────────────────────────────────────────────────────
app.use(
  helmet({
    // Why disable this: helmet blocks cross-origin video streaming by default.
    // R2 videos are on a different origin from our API.
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: config.app.clientUrl,
    credentials: true,
  })
);

if (config.app.env !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/certificates', certificatesRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
// Why: deployment platforms ping this to check if the server is alive.
// Returns 200 OK if the server is running.
app.get('/health', (req, res) => res.json({ status: 'ok', env: config.app.env }));

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.app.isDev && { stack: err.stack }), // only show stack in dev
  });
});

export default app;
