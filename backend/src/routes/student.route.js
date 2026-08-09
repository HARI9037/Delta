import express from 'express';
const router = express.Router();
import studentController from '../controllers/student.controller.js';
import { authenticateStudent } from '../middlewares/student.middlewares.js';
import { upload } from '../middlewares/upload.middleware.js';
import multer from 'multer';
import responseHelper from '../utils/response.js';

// Public routes
router.post('/register', (req, res) => studentController.register(req, res));
router.post('/login', (req, res) => studentController.login(req, res));

// Protected routes
router.get('/profile', authenticateStudent, (req, res) => studentController.getProfile(req, res));
router.put('/profile', authenticateStudent, (req, res) => studentController.updateProfile(req, res));

// Profile photo upload (multer errors handled inline for clean responses)
router.post('/profile/photo', authenticateStudent, (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return responseHelper.error(res, 413, 'Photo is too large. Maximum size is 2 MB.', err.message);
      }
      return responseHelper.error(res, 400, err.message || 'Invalid file upload', err.message);
    }
    next();
  });
}, (req, res) => studentController.uploadProfilePhoto(req, res));

router.get('/teachers', authenticateStudent, (req, res) => studentController.getAllTeachers(req, res));
router.get('/teachers/:id', authenticateStudent, (req, res) => studentController.getTeacher(req, res));
router.post('/bookings', authenticateStudent, (req, res) => studentController.bookSlot(req, res));
router.get('/dashboard', authenticateStudent, (req, res) => studentController.getDashboard(req, res));

// Notifications (from teachers, e.g. requests to add grade/class)
router.get('/notifications', authenticateStudent, (req, res) => studentController.getNotifications(req, res));
router.put('/notifications/read', authenticateStudent, (req, res) => studentController.markNotificationsRead(req, res));

export default router;
