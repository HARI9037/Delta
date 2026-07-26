import express from 'express';
const router = express.Router();
import paymentController from '../controllers/payment.controller.js';
import { authenticateStudent } from '../middlewares/student.middlewares.js';

// All payment routes are protected for students
router.get('/', authenticateStudent, (req, res) => paymentController.getPayments(req, res));
router.post('/receipt', authenticateStudent, (req, res) => paymentController.uploadReceipt(req, res));

export default router;
