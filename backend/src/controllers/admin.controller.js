import adminService from '../services/admin.service.js';
import responseHelper from '../utils/response.js';

class AdminController {
  async getDashboard(req, res) {
    try {
      const data = await adminService.getDashboardStats();
      return responseHelper.success(res, 200, 'Admin dashboard data fetched successfully', data);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch admin dashboard', error.message);
    }
  }

  async getRegistrations(req, res) {
    try {
      const { role, status } = req.query;
      const data = await adminService.getRegistrationRequests(role, status);
      return responseHelper.success(res, 200, 'Registration requests fetched successfully', data);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch registration requests', error.message);
    }
  }

  async updateRegistrationStatus(req, res) {
    try {
      const { id } = req.params;
      const { role, status } = req.body;
      const result = await adminService.updateRegistrationStatus(id, role, status);
      return responseHelper.success(res, 200, `Registration ${status.toLowerCase()} successfully`, result);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to update registration status', error.message);
    }
  }

  async getAllStudents(req, res) {
    try {
      const students = await adminService.getAllStudents(req.query);
      return responseHelper.success(res, 200, 'Students fetched successfully', students);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch students', error.message);
    }
  }

  async getStudentDetails(req, res) {
    try {
      const data = await adminService.getStudentDetails(req.params.id);
      return responseHelper.success(res, 200, 'Student details fetched successfully', data);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 404, error.message || 'Failed to fetch student details', error.message);
    }
  }

  async getAllTeachers(req, res) {
    try {
      const teachers = await adminService.getAllTeachers(req.query);
      return responseHelper.success(res, 200, 'Teachers fetched successfully', teachers);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch teachers', error.message);
    }
  }

  async getTeacherDetails(req, res) {
    try {
      const data = await adminService.getTeacherDetails(req.params.id);
      return responseHelper.success(res, 200, 'Teacher details fetched successfully', data);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 404, error.message || 'Failed to fetch teacher details', error.message);
    }
  }

  async getPendingBookings(req, res) {
    try {
      const bookings = await adminService.getPendingBookings();
      return responseHelper.success(res, 200, 'Pending bookings fetched successfully', bookings);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch pending bookings', error.message);
    }
  }

  async confirmOrRejectBooking(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const booking = await adminService.confirmOrRejectBooking(id, status);
      return responseHelper.success(res, 200, `Booking ${status.toLowerCase()} successfully`, booking);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to update booking status', error.message);
    }
  }

  async getAllBookings(req, res) {
    try {
      const bookings = await adminService.getAllBookings(req.query);
      return responseHelper.success(res, 200, 'All bookings fetched successfully', bookings);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch bookings', error.message);
    }
  }
}

export default new AdminController();
