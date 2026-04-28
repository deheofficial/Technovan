import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from './lib/prisma';

dotenv.config();

// Fallback secrets for local dev without .env
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import authRoutes from './routes/auth';
import servicesRoutes from './routes/services';
import pricingRoutes from './routes/pricing';
import projectRoutes from './routes/projects';
import paymentRoutes from './routes/payments';
import inquiryRoutes from './routes/inquiries';
import contactRoutes from './routes/contact';
import adminRoutes from './routes/admin';
import portfolioRoutes from './routes/portfolio';
import blogRoutes from './routes/blog';

const app: Express = express();

// Trust Railway/Cloudflare proxy (required for express-rate-limit and real IP)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // disabled so CDN scripts work
}));
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/blog', blogRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date(), env: process.env.NODE_ENV });
});

// API 404 handler
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API route not found', path: req.path });
});

// Serve frontend for all non-API routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💾 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  prisma.$disconnect().finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  prisma.$disconnect().finally(() => process.exit(0));
});
