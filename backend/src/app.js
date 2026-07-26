import express from 'express';
import cors from 'cors';
import studentRoutes from './routes/student.route.js';
import teacherRoutes from './routes/teacher.route.js';
import responseHelper from './utils/response.js';

import paymentRoutes from './routes/payment.route.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/user', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/payment', paymentRoutes);

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
