import jwt from 'jsonwebtoken';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Availability, { MIN_STUDENTS_PER_SLOT } from '../models/availability.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Notification from '../models/notification.model.js';

// Local timezone date as "YYYY-MM-DD" (matches date strings from <input type="date">)
function localDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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

    // Frontend sends "grade"; model stores it as "class"
    if (studentData.grade !== undefined) {
      studentData.class = studentData.grade;
      delete studentData.grade;
    }

    const student = await Student.create(studentData);
    const studentObj = student.toObject();
    delete studentObj.password;

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    studentObj.grade = studentObj.class;

    return { student: studentObj, token };
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
   * Persist an uploaded profile photo for a student
   */
  async uploadProfilePhoto(studentId, file) {
    if (!file) {
      const error = new Error('No photo file provided');
      error.statusCode = 400;
      throw error;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      const error = new Error('Student profile not found');
      error.statusCode = 404;
      throw error;
    }

    student.profilePhoto = `/api/uploads/${file.filename}`;
    await student.save();

    const studentObj = student.toObject();
    delete studentObj.password;
    studentObj.grade = studentObj.class;

    return studentObj;
  }

  /**
   * Get all teachers with optional filters
   */
  async getAllTeachers(studentId, filters = {}) {
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

    const availabilityIds = availabilities.map(a => a._id);
    const [slotBookings, myBookings] = await Promise.all([
      Booking.find({
        availabilityId: { $in: availabilityIds },
        status: { $in: ['Pending', 'Approved'] },
      }).select('availabilityId').lean(),
      Booking.find({
        studentId,
        status: { $in: ['Pending', 'Approved'] },
      }).select('availabilityId').lean(),
    ]);

    // Count active bookings per slot
    const slotCounts = new Map();
    for (const b of slotBookings) {
      const key = b.availabilityId.toString();
      slotCounts.set(key, (slotCounts.get(key) || 0) + 1);
    }

    // Slots this student has already booked
    const mySlots = new Set(myBookings.map(b => b.availabilityId.toString()));

    return teachers.map(teacher => ({
      ...teacher,
      name: teacher.fullName,
      availability: availabilities
        .filter(a => a.teacherId.toString() === teacher._id.toString())
        .map(a => {
          const count = slotCounts.get(a._id.toString()) || 0;
          const minStudents = a.minStudents || MIN_STUDENTS_PER_SLOT;
          return {
            ...a,
            bookedCount: count,
            minStudents,
            isBooked: count >= minStudents || mySlots.has(a._id.toString()),
          };
        })
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

    const minStudents = availability.minStudents || MIN_STUDENTS_PER_SLOT;

    // Same student cannot book the same teacher for the same day & time twice
    const duplicate = await Booking.findOne({
      studentId,
      teacherId,
      date: availability.date,
      startTime,
      endTime,
      status: { $in: ['Pending', 'Approved'] },
    });
    if (duplicate) {
      const error = new Error('You have already booked this teacher for this day and time');
      error.statusCode = 400;
      throw error;
    }

    // Slot is full once it reaches the minimum number of students
    const activeCount = await Booking.countDocuments({
      availabilityId,
      status: { $in: ['Pending', 'Approved'] },
    });
    if (activeCount >= minStudents) {
      const error = new Error('This time slot is already full');
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
      status: 'Pending'
    });

    // Automatically close the slot once the minimum number of students is reached
    const newCount = await Booking.countDocuments({
      availabilityId,
      status: { $in: ['Pending', 'Approved'] },
    });
    if (newCount >= minStudents) {
      await Availability.updateOne({ _id: availabilityId }, { enabled: false });
    }

    return booking;
  }

  /**
   * Get notifications for the student
   */
  async getNotifications(studentId) {
    return await Notification.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('teacherId', 'fullName');
  }

  /**
   * Mark all student notifications as read
   */
  async markNotificationsRead(studentId) {
    await Notification.updateMany({ studentId, read: false }, { read: true });
    return { updated: true };
  }

  /**
   * Get Student Dashboard Data
   */
  async getDashboard(studentId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = localDateStr();
    const tomorrowStr = localDateStr(tomorrow);

    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear().toString();

    const [todaysClasses, upcomingClasses, bookingHistory, currentMonthPayment] = await Promise.all([
      Booking.find({
        studentId,
        date: todayStr,
        status: 'Approved'
      }).populate('teacherId', 'fullName email phone profilePhoto'),

      Booking.find({
        studentId,
        date: { $gte: tomorrowStr },
        status: 'Approved'
      }).sort({ date: 1, startTime: 1 }).limit(5).populate('teacherId', 'fullName email phone profilePhoto'),

      Booking.find({
        studentId,
      }).sort({ createdAt: -1 }).limit(10).populate('teacherId', 'fullName profilePhoto'),

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
