import express from 'express';
const router = express.Router();
import paymentController from '../controllers/payment.controller.js';
import { authenticateStudent } from '../middlewares/student.middlewares.js';
<<<<<<< Updated upstream

// All payment routes are protected for students
router.get('/', authenticateStudent, (req, res) => paymentController.getPayments(req, res));
router.post('/receipt', authenticateStudent, (req, res) => paymentController.uploadReceipt(req, res));

=======
import { authenticateTeacher } from '../middlewares/teacher.middlewares.js';

// ── Public ──────────────────────────────────────
// Anyone (incl. frontend pre-login) can read the config to know the fee amount
router.get('/config', (req, res) => paymentController.getConfig(req, res));

// ── Student routes ───────────────────────────────
// Get this student's payment history
router.get('/', authenticateStudent, (req, res) => paymentController.getPayments(req, res));

// Get/create current-month payment status (used by PaymentGate)
router.get('/status', authenticateStudent, (req, res) => paymentController.getPaymentStatus(req, res));

// Demo pay — student clicks "Pay Now"
router.post('/demo-pay', authenticateStudent, (req, res) => paymentController.demoPayNow(req, res));

// Legacy: upload a receipt URL
router.post('/receipt', authenticateStudent, (req, res) => paymentController.uploadReceipt(req, res));

// ── Admin / Teacher routes ────────────────────────
// Update fee config (admin)
router.put('/config', authenticateTeacher, (req, res) => paymentController.updateConfig(req, res));

// All students' payments
router.get('/admin/all', authenticateTeacher, (req, res) => paymentController.getAllPayments(req, res));

// Verify / reject a specific payment
router.put('/admin/:id/verify', authenticateTeacher, (req, res) => paymentController.verifyPayment(req, res));
router.put('/admin/:id/reject', authenticateTeacher, (req, res) => paymentController.rejectPayment(req, res));

>>>>>>> Stashed changes
export default router;
