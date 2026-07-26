import express from 'express';
const router = express.Router();
import studentController from '../controllers/student.controller.js';
import { authenticateStudent } from '../middlewares/student.middlewares.js';

// Public routes
router.post('/register', (req, res) => studentController.register(req, res));
router.post('/login', (req, res) => studentController.login(req, res));

// Protected routes
router.get('/profile', authenticateStudent, (req, res) => studentController.getProfile(req, res));
router.put('/profile', authenticateStudent, (req, res) => studentController.updateProfile(req, res));

router.get('/teachers', authenticateStudent, (req, res) => studentController.getAllTeachers(req, res));
router.get('/teachers/:id', authenticateStudent, (req, res) => studentController.getTeacher(req, res));
router.post('/bookings', authenticateStudent, (req, res) => studentController.bookSlot(req, res));
router.get('/dashboard', authenticateStudent, (req, res) => studentController.getDashboard(req, res));

export default router;
