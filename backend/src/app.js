import express from 'express';
import cors from 'cors';
import studentRoutes from './routes/student.route.js';
import teacherRoutes from './routes/teacher.route.js';
import responseHelper from './utils/response.js';
import { uploadDir } from './middlewares/upload.middleware.js';

import paymentRoutes from './routes/payment.route.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded profile photos (dev: forwarded by Vite /api proxy)
app.use('/api/uploads', express.static(uploadDir));

// Routes
app.use('/api/user', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  return responseHelper.success(res, 200, 'Server is healthy');
});

// 404 Handler
app.use((req, res) => {
  return responseHelper.error(res, 404, 'Route not found');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  return responseHelper.error(res, err.statusCode || 500, err.message || 'Internal Server Error', err.message);
});

export default app;
