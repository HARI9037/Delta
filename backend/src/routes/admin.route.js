import express from 'express';
const router = express.Router();
import adminController from '../controllers/admin.controller.js';
import { authenticateTeacher, authorizeAdmin } from '../middlewares/teacher.middlewares.js';

// All admin routes require Teacher authentication + Admin authorization
router.use(authenticateTeacher, authorizeAdmin);

// Admin Dashboard stats
router.get('/dashboard', (req, res) => adminController.getDashboard(req, res));

// Registration Approval
router.get('/registrations', (req, res) => adminController.getRegistrations(req, res));
router.put('/registrations/:id/status', (req, res) => adminController.updateRegistrationStatus(req, res));

// View All Students & Details
router.get('/students', (req, res) => adminController.getAllStudents(req, res));
router.get('/students/:id', (req, res) => adminController.getStudentDetails(req, res));

// View All Teachers & Details
router.get('/teachers', (req, res) => adminController.getAllTeachers(req, res));
router.get('/teachers/:id', (req, res) => adminController.getTeacherDetails(req, res));

// Booking Confirmations & All Bookings
router.get('/bookings/pending', (req, res) => adminController.getPendingBookings(req, res));
router.put('/bookings/:id/status', (req, res) => adminController.confirmOrRejectBooking(req, res));
router.get('/bookings', (req, res) => adminController.getAllBookings(req, res));

export default router;
