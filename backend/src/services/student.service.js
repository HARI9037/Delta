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
<<<<<<< Updated upstream
    const student = await Student.findById(studentId);
=======
    const student = await Student.findById(studentId).lean();
>>>>>>> Stashed changes
    if (!student) {
      const error = new Error('Student profile not found');
      error.statusCode = 444;
      throw error;
    }
<<<<<<< Updated upstream
=======
    student.grade = student.class;
>>>>>>> Stashed changes
    return student;
  }

  /**
   * Update editable fields of student profile
   */
  async updateStudentProfile(studentId, updateData) {
<<<<<<< Updated upstream
    const { phone, password, profilePhoto } = updateData;
    const allowedUpdates = {};

    if (phone !== undefined) allowedUpdates.phone = phone;
    if (profilePhoto !== undefined) allowedUpdates.profilePhoto = profilePhoto;
=======
    const { name, phone, password, profilePhoto, grade } = updateData;
>>>>>>> Stashed changes

    const student = await Student.findById(studentId);
    if (!student) {
      const error = new Error('Student profile not found');
      error.statusCode = 404;
      throw error;
    }

<<<<<<< Updated upstream
    if (phone !== undefined) student.phone = phone;
    if (profilePhoto !== undefined) student.profilePhoto = profilePhoto;
=======
    if (name !== undefined) student.name = name;
    if (phone !== undefined) student.phone = phone;
    if (profilePhoto !== undefined) student.profilePhoto = profilePhoto;
    if (grade !== undefined) student.class = grade;
    if (updateData.class !== undefined) student.class = updateData.class;
>>>>>>> Stashed changes
    if (password) student.password = password; // Will trigger pre-save password hash hook

    await student.save();

    const studentObj = student.toObject();
    delete studentObj.password;
<<<<<<< Updated upstream
=======
    studentObj.grade = studentObj.class;
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
    const availabilities = await Availability.find({ teacherId: { $in: teacherIds }, enabled: true }).sort({ day: 1, startTime: 1 }).lean();
=======
    const availabilities = await Availability.find({ teacherId: { $in: teacherIds }, enabled: true }).sort({ date: 1, startTime: 1 }).lean();
>>>>>>> Stashed changes
    
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
<<<<<<< Updated upstream
    const availability = await Availability.find({ teacherId, enabled: true }).sort({ day: 1, startTime: 1 });
=======
    const availability = await Availability.find({ teacherId, enabled: true }).sort({ date: 1, startTime: 1 });
>>>>>>> Stashed changes
    return { teacher, availability };
  }

  /**
   * Book a slot
   */
  async bookSlot(studentId, bookingData) {
<<<<<<< Updated upstream
    const { teacherId, availabilityId, subject, day, date, startTime, endTime, mode, requirement } = bookingData;

    if (!teacherId || !availabilityId || !subject || !day || !date || !startTime || !endTime || !mode) {
=======
    const { teacherId, availabilityId, subject, startTime, endTime, mode, requirement } = bookingData;

    if (!teacherId || !availabilityId || !subject || !startTime || !endTime || !mode) {
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    // Check if slot is already booked for this specific date
    const existingBooking = await Booking.findOne({
      teacherId,
      date: new Date(date),
      startTime,
      endTime,
      status: { $in: ['Pending', 'Approved'] }
    });

    if (existingBooking) {
      const error = new Error('This slot is already booked for the selected date');
      error.statusCode = 400;
      throw error;
    }

=======
>>>>>>> Stashed changes
    const booking = await Booking.create({
      studentId,
      teacherId,
      availabilityId,
      subject,
<<<<<<< Updated upstream
      day,
      date: new Date(date),
=======
      date: availability.date,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
>>>>>>> Stashed changes

    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear().toString();

    const [todaysClasses, upcomingClasses, bookingHistory, currentMonthPayment] = await Promise.all([
      Booking.find({
        studentId,
<<<<<<< Updated upstream
        date: { $gte: today, $lt: tomorrow },
=======
        date: todayStr,
>>>>>>> Stashed changes
        status: 'Approved'
      }).populate('teacherId', 'fullName email phone'),

      Booking.find({
        studentId,
<<<<<<< Updated upstream
        date: { $gte: tomorrow },
=======
        date: { $gte: tomorrowStr },
>>>>>>> Stashed changes
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
