import express from 'express';
const router = express.Router();
import teacherController from '../controllers/teacher.controller.js';
import { authenticateTeacher } from '../middlewares/teacher.middlewares.js';

// Public Auth routes
router.post('/register', (req, res) => teacherController.register(req, res));
router.post('/login', (req, res) => teacherController.login(req, res));

// Protected Profile routes
router.get('/profile', authenticateTeacher, (req, res) => teacherController.getProfile(req, res));
router.put('/profile', authenticateTeacher, (req, res) => teacherController.updateProfile(req, res));

// Protected Assigned Students route
router.get('/students', authenticateTeacher, (req, res) => teacherController.getAssignedStudents(req, res));

// Protected Availability routes
router.get('/availability', authenticateTeacher, (req, res) => teacherController.getAvailability(req, res));
router.post('/availability', authenticateTeacher, (req, res) => teacherController.addAvailability(req, res));
router.put('/availability/:id', authenticateTeacher, (req, res) => teacherController.updateAvailability(req, res));
router.delete('/availability/:id', authenticateTeacher, (req, res) => teacherController.deleteAvailability(req, res));

// Protected Booking routes (teacher manages student bookings)
router.get('/bookings', authenticateTeacher, (req, res) => teacherController.getBookings(req, res));


// Protected Dashboard route
router.get('/dashboard', authenticateTeacher, (req, res) => teacherController.getDashboard(req, res));

export default router;
