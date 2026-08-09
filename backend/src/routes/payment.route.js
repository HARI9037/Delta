import express from 'express';
const router = express.Router();
import paymentController from '../controllers/payment.controller.js';
import { authenticateStudent } from '../middlewares/student.middlewares.js';
import { authenticateTeacher, authorizeAdmin } from '../middlewares/teacher.middlewares.js';

// ── Student routes ───────────────────────────────
// Get this student's payment history
router.get('/', authenticateStudent, (req, res) => paymentController.getPayments(req, res));

// Get/create current-month payment status (used by PaymentGate)
router.get('/status', authenticateStudent, (req, res) => paymentController.getPaymentStatus(req, res));

// Demo pay — student clicks "Pay Now"
router.post('/demo-pay', authenticateStudent, (req, res) => paymentController.demoPayNow(req, res));

// Legacy: upload a receipt URL
router.post('/receipt', authenticateStudent, (req, res) => paymentController.uploadReceipt(req, res));

// ── Admin routes ─────────────────────────────────
// Fee config is read/written only by admin
router.get('/config', authenticateTeacher, authorizeAdmin, (req, res) => paymentController.getConfig(req, res));
router.put('/config', authenticateTeacher, authorizeAdmin, (req, res) => paymentController.updateConfig(req, res));

// All students' payments
router.get('/admin/all', authenticateTeacher, authorizeAdmin, (req, res) => paymentController.getAllPayments(req, res));

// Verify / reject a specific payment
router.put('/admin/:id/verify', authenticateTeacher, authorizeAdmin, (req, res) => paymentController.verifyPayment(req, res));
router.put('/admin/:id/reject', authenticateTeacher, authorizeAdmin, (req, res) => paymentController.rejectPayment(req, res));

export default router;
