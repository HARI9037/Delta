import studentService from '../services/student.service.js';
import responseHelper from '../utils/response.js';

class StudentController {
  async register(req, res) {
    try {
      const student = await studentService.registerStudent(req.body);
      return responseHelper.success(res, 201, 'Student registered successfully', student);
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
      const result = await studentService.loginStudent(email, password);
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
      const student = await studentService.getStudentProfile(req.user._id);
      return responseHelper.success(res, 200, 'Profile fetched successfully', student);
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
      const updatedStudent = await studentService.updateStudentProfile(req.user._id, req.body);
      return responseHelper.success(res, 200, 'Profile updated successfully', updatedStudent);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to update profile',
        error.message
      );
    }
  }

  async getAllTeachers(req, res) {
    try {
      const teachers = await studentService.getAllTeachers(req.user._id, req.query);
      return responseHelper.success(res, 200, 'Teachers fetched successfully', teachers);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to fetch teachers',
        error.message
      );
    }
  }

  async getTeacher(req, res) {
    try {
      const data = await studentService.getTeacher(req.params.id);
      return responseHelper.success(res, 200, 'Teacher details fetched successfully', data);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 404,
        error.message || 'Failed to fetch teacher',
        error.message
      );
    }
  }

  async bookSlot(req, res) {
    try {
      const booking = await studentService.bookSlot(req.user._id, req.body);
      return responseHelper.success(res, 201, 'Slot booked successfully', booking);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Booking failed',
        error.message
      );
    }
  }

  async getDashboard(req, res) {
    try {
      const dashboardData = await studentService.getDashboard(req.user._id);
      return responseHelper.success(res, 200, 'Dashboard data fetched successfully', dashboardData);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to fetch dashboard',
        error.message
      );
    }
  }
}

export default new StudentController();
