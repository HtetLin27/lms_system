
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
dotenv.config();

const app = express();

// ── Security middleware ────────────────────────────────────────────────────────
// Why helmet first: security headers applied before anything else
app.use(helmet({
  // Why disable this: helmet blocks cross-origin video streaming by default.
  // R2 videos are on a different origin from our API.
  crossOriginResourcePolicy: false,
}));

// Why cors here: allow the React client to make requests to this API.
// Without this, every Axios call returns a CORS error in the browser.
app.use(cors({
  origin:      config.app.clientUrl,
  credentials: true,
}));

// ── Logging ───────────────────────────────────────────────────────────────────
// Why check env: we do not want 'GET /api/courses 200 12ms' appearing
// in test output — it clutters the test results.
if (config.app.env !== 'test') {
  app.use(morgan('dev'));
}

// ── Body parsing ──────────────────────────────────────────────────────────────
// Why: Express does not parse request bodies by default.
// express.json() reads JSON bodies and puts them in req.body.
// Note: multipart/form-data (file uploads) is handled by Multer, not here.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
// Why: deployment platforms ping this to check if the server is alive.
// Returns 200 OK if the server is running.
app.get('/health', (req, res) => res.json({ status: 'ok', env: config.app.env }));

// ── 404 handler ───────────────────────────────────────────────────────────────
// Why: if no route matched, return a clear 404 instead of Express's
// default HTML error page.
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
// Why four parameters: Express recognises a function with four params as
// an error handler. The first param 'err' is the error passed to next(err).
// Without this, unhandled errors return an ugly HTML page.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error:   err.message || 'Internal server error',
    ...(config.app.isDev && { stack: err.stack }), // only show stack in dev
  });
});

export default app;
