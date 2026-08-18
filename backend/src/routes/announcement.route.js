import express from 'express';
import jwt from 'jsonwebtoken';
import announcementController from '../controllers/announcement.controller.js';
import { authenticateTeacher, authorizeAdmin } from '../middlewares/teacher.middlewares.js';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import responseHelper from '../utils/response.js';

const router = express.Router();

// Middleware to authenticate either a Student or Teacher/Admin token for viewing active announcements
const authenticateAnyUser = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token) {
      return responseHelper.error(res, 401, 'Access denied. No authentication token provided.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'student') {
      const student = await Student.findById(decoded.id);
      if (!student || !student.active) {
        return responseHelper.error(res, 401, 'Student account invalid or inactive.');
      }
      req.user = { ...student.toObject(), role: 'student' };
    } else {
      const teacher = await Teacher.findById(decoded.id);
      if (!teacher || !teacher.active) {
        return responseHelper.error(res, 401, 'Teacher account invalid or inactive.');
      }
      req.user = teacher;
    }

    next();
  } catch (error) {
    return responseHelper.error(res, 401, 'Authentication failed', error.message);
  }
};

// ── User Feed Endpoint ──────────────────────────────
router.get('/active', authenticateAnyUser, (req, res) => announcementController.getActiveAnnouncements(req, res));

// ── Admin Endpoints ─────────────────────────────────
router.get('/admin', authenticateTeacher, authorizeAdmin, (req, res) => announcementController.getAllAnnouncementsAdmin(req, res));
router.post('/', authenticateTeacher, authorizeAdmin, (req, res) => announcementController.createAnnouncement(req, res));
router.put('/:id', authenticateTeacher, authorizeAdmin, (req, res) => announcementController.updateAnnouncement(req, res));
router.delete('/:id', authenticateTeacher, authorizeAdmin, (req, res) => announcementController.deleteAnnouncement(req, res));
router.put('/:id/publish', authenticateTeacher, authorizeAdmin, (req, res) => announcementController.togglePublish(req, res));

export default router;
