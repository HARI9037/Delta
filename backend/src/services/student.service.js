import jwt from 'jsonwebtoken';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Availability from '../models/availability.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
class StudentService {
  /**
   * Register a new student
   */
  async registerStudent(studentData) {
    const { email } = studentData;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      const error = new Error('Email is already registered');
      error.statusCode = 400;
      throw error;
    }

    const student = await Student.create(studentData);
    const studentObj = student.toObject();
    delete studentObj.password;

    return studentObj;
  }

  /**
   * Authenticate student and issue JWT token
   */
  async loginStudent(email, password) {
    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      throw error;
    }

    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!student.active) {
      const error = new Error('Account is deactivated. Please contact administration');
      error.statusCode = 403;
      throw error;
    }

    if (student.status !== 'Verified') {
      const error = new Error(`Account status is ${student.status}. Only verified accounts can log in`);
      error.statusCode = 403;
      throw error;
    }

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const studentObj = student.toObject();
    delete studentObj.password;

    return { student: studentObj, token };
  }

  /**
   * Fetch student profile by ID
   */
  async getStudentProfile(studentId) {
    const student = await Student.findById(studentId).lean();
    if (!student) {
      const error = new Error('Student profile not found');
      error.statusCode = 444;
      throw error;
    }
    student.grade = student.class;
    return student;
  }

  /**
   * Update editable fields of student profile
   */
  async updateStudentProfile(studentId, updateData) {
    const { name, phone, password, profilePhoto, grade } = updateData;

    const student = await Student.findById(studentId);
    if (!student) {
      const error = new Error('Student profile not found');
      error.statusCode = 404;
      throw error;
    }

    if (name !== undefined) student.name = name;
    if (phone !== undefined) student.phone = phone;
    if (profilePhoto !== undefined) student.profilePhoto = profilePhoto;
    if (grade !== undefined) student.class = grade;
    if (updateData.class !== undefined) student.class = updateData.class;
    if (password) student.password = password; // Will trigger pre-save password hash hook

    await student.save();

    const studentObj = student.toObject();
    delete studentObj.password;
    studentObj.grade = studentObj.class;

    return studentObj;
  }

  /**
   * Get all teachers with optional filters
   */
  async getAllTeachers(filters = {}) {
    const query = { status: 'Verified', active: true };
    if (filters.subject) {
      query.subjects = { $in: [filters.subject] };
    }
    if (filters.teachingMode && filters.teachingMode !== 'Both') {
      query.teachingMode = { $in: [filters.teachingMode, 'Both'] };
    }
    const teachers = await Teacher.find(query).select('-password').lean();
    
    const teacherIds = teachers.map(t => t._id);
    const availabilities = await Availability.find({ teacherId: { $in: teacherIds }, enabled: true }).sort({ date: 1, startTime: 1 }).lean();
    
    return teachers.map(teacher => ({
      ...teacher,
      name: teacher.fullName,
      availability: availabilities.filter(a => a.teacherId.toString() === teacher._id.toString())
    }));
  }

  /**
   * Get specific teacher details and their availability
   */
  async getTeacher(teacherId) {
    const teacher = await Teacher.findById(teacherId).select('-password');
    if (!teacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      throw error;
    }
    const availability = await Availability.find({ teacherId, enabled: true }).sort({ date: 1, startTime: 1 });
    return { teacher, availability };
  }

  /**
   * Book a slot
   */
  async bookSlot(studentId, bookingData) {
    const { teacherId, availabilityId, subject, startTime, endTime, mode, requirement } = bookingData;

    if (!teacherId || !availabilityId || !subject || !startTime || !endTime || !mode) {
      const error = new Error('Missing required booking fields');
      error.statusCode = 400;
      throw error;
    }

    // Verify availability
    const availability = await Availability.findOne({ _id: availabilityId, teacherId, enabled: true });
    if (!availability) {
      const error = new Error('Selected availability slot is invalid or inactive');
      error.statusCode = 400;
      throw error;
    }

    const booking = await Booking.create({
      studentId,
      teacherId,
      availabilityId,
      subject,
      date: availability.date,
      startTime,
      endTime,
      mode,
      requirement,
      status: 'Approved'
    });

    return booking;
  }

  /**
   * Get Student Dashboard Data
   */
  async getDashboard(studentId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear().toString();

    const [todaysClasses, upcomingClasses, bookingHistory, currentMonthPayment] = await Promise.all([
      Booking.find({
        studentId,
        date: todayStr,
        status: 'Approved'
      }).populate('teacherId', 'fullName email phone'),

      Booking.find({
        studentId,
        date: { $gte: tomorrowStr },
        status: 'Approved'
      }).sort({ date: 1, startTime: 1 }).limit(5).populate('teacherId', 'fullName email phone'),

      Booking.find({
        studentId,
      }).sort({ createdAt: -1 }).limit(10).populate('teacherId', 'fullName'),

      Payment.findOne({ studentId, month: currentMonth, year: currentYear })
    ]);

    return {
      todaysClasses,
      upcomingClasses,
      bookingHistory,
      currentMonthPayment
    };
  }
}

export default new StudentService();
