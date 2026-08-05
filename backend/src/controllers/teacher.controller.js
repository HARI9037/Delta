import teacherService from '../services/teacher.service.js';
import responseHelper from '../utils/response.js';

class TeacherController {
  async register(req, res) {
    try {
      const teacher = await teacherService.registerTeacher(req.body);
      return responseHelper.success(res, 201, 'Teacher registered successfully', teacher);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Registration failed',
        error.message
      );
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await teacherService.loginTeacher(email, password);
      return responseHelper.success(res, 200, 'Login successful', result);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 401,
        error.message || 'Login failed',
        error.message
      );
    }
  }

  async getProfile(req, res) {
    try {
      const teacher = await teacherService.getTeacherProfile(req.user._id);
      return responseHelper.success(res, 200, 'Profile fetched successfully', teacher);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to retrieve profile',
        error.message
      );
    }
  }

  async updateProfile(req, res) {
    try {
      const updatedTeacher = await teacherService.updateTeacherProfile(req.user._id, req.body);
      return responseHelper.success(res, 200, 'Profile updated successfully', updatedTeacher);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to update profile',
        error.message
      );
    }
  }

  async getAssignedStudents(req, res) {
    try {
      const students = await teacherService.getAssignedStudents(req.user._id);
      return responseHelper.success(res, 200, 'Assigned students fetched successfully', students);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to retrieve assigned students',
        error.message
      );
    }
  }

  async getAvailability(req, res) {
    try {
      const availability = await teacherService.getAvailability(req.user._id);
      return responseHelper.success(res, 200, 'Availability fetched successfully', availability);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to retrieve availability',
        error.message
      );
    }
  }

  async addAvailability(req, res) {
    try {
      const newSlot = await teacherService.addAvailability(req.user._id, req.body);
      return responseHelper.success(res, 201, 'Availability slot added successfully', newSlot);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to add availability slot',
        error.message
      );
    }
  }

  async updateAvailability(req, res) {
    try {
      const updatedSlot = await teacherService.updateAvailability(
        req.user._id,
        req.params.id,
        req.body
      );
      return responseHelper.success(res, 200, 'Availability slot updated successfully', updatedSlot);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to update availability slot',
        error.message
      );
    }
  }

  async deleteAvailability(req, res) {
    try {
      const result = await teacherService.deleteAvailability(req.user._id, req.params.id);
      return responseHelper.success(res, 200, 'Availability slot deleted successfully', result);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to delete availability slot',
        error.message
      );
    }
  }

<<<<<<< Updated upstream
=======
  async getBookings(req, res) {
    try {
      const bookings = await teacherService.getBookings(req.user._id, req.query.status);
      return responseHelper.success(res, 200, 'Bookings fetched successfully', bookings);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to fetch bookings',
        error.message
      );
    }
  }



>>>>>>> Stashed changes
  async getDashboard(req, res) {
    try {
      const dashboardData = await teacherService.getDashboard(req.user._id);
      return responseHelper.success(res, 200, 'Dashboard data fetched successfully', dashboardData);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to fetch dashboard data',
        error.message
      );
    }
  }
}

export default new TeacherController();
