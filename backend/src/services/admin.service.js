import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';

class AdminService {
  /**
   * Aggregate high-level system statistics for Admin Dashboard
   */
  async getDashboardStats() {
    const [
      totalStudents,
      totalTeachers,
      pendingStudents,
      pendingTeachers,
      pendingPayments,
      pendingBookings,
      totalBookings,
      recentRegistrations,
      recentPayments,
    ] = await Promise.all([
      Student.countDocuments({ active: true }),
      Teacher.countDocuments({ active: true }),
      Student.countDocuments({ status: 'Pending' }),
      Teacher.countDocuments({ status: 'Pending' }),
      Payment.countDocuments({ status: { $in: ['Pending', 'Uploaded'] } }),
      Booking.countDocuments({ status: 'Pending' }),
      Booking.countDocuments(),
      
      // Recent registration requests
      Promise.all([
        Student.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(5).lean(),
        Teacher.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(5).lean(),
      ]),

      // Recent pending payments
      Payment.find({ status: { $in: ['Pending', 'Uploaded'] } })
        .populate('studentId', 'name email class')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const pendingRegistrationsCount = pendingStudents + pendingTeachers;

    const formattedPendingRegs = [
      ...recentRegistrations[0].map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: 'student',
        status: s.status,
        createdAt: s.createdAt,
        profilePhoto: s.profilePhoto,
        details: { grade: s.class, school: s.school, subjects: s.subjects },
      })),
      ...recentRegistrations[1].map(t => ({
        _id: t._id,
        name: t.fullName,
        email: t.email,
        phone: t.phone,
        role: 'teacher',
        status: t.status,
        createdAt: t.createdAt,
        profilePhoto: t.profilePhoto,
        details: { qualification: t.qualification, subjects: t.subjects, teachingExperience: t.teachingExperience },
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return {
      stats: {
        totalStudents,
        totalTeachers,
        pendingRegistrations: pendingRegistrationsCount,
        pendingPayments,
        pendingBookings,
        totalBookings,
      },
      recentPendingRegistrations: formattedPendingRegs,
      recentPendingPayments: recentPayments,
    };
  }

  /**
   * Get registration requests (Pending or filtered by role / status)
   */
  async getRegistrationRequests(roleFilter = 'all', statusFilter = 'Pending') {
    const studentQuery = {};
    const teacherQuery = {};

    if (statusFilter && statusFilter !== 'all') {
      studentQuery.status = statusFilter;
      teacherQuery.status = statusFilter;
    }

    let students = [];
    let teachers = [];

    if (roleFilter === 'all' || roleFilter === 'student') {
      students = await Student.find(studentQuery).sort({ createdAt: -1 }).lean();
    }

    if (roleFilter === 'all' || roleFilter === 'teacher') {
      teachers = await Teacher.find(teacherQuery).sort({ createdAt: -1 }).lean();
    }

    const items = [
      ...students.map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: 'student',
        status: s.status,
        active: s.active,
        createdAt: s.createdAt,
        profilePhoto: s.profilePhoto,
        grade: s.class,
        school: s.school,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        subjects: s.subjects,
      })),
      ...teachers.map(t => ({
        _id: t._id,
        name: t.fullName,
        email: t.email,
        phone: t.phone,
        role: 'teacher',
        status: t.status,
        active: t.active,
        createdAt: t.createdAt,
        profilePhoto: t.profilePhoto,
        qualification: t.qualification,
        teachingExperience: t.teachingExperience,
        teachingMode: t.teachingMode,
        subjects: t.subjects,
        bio: t.bio,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const pendingStudentsCount = await Student.countDocuments({ status: 'Pending' });
    const pendingTeachersCount = await Teacher.countDocuments({ status: 'Pending' });

    return {
      requests: items,
      counts: {
        all: pendingStudentsCount + pendingTeachersCount,
        students: pendingStudentsCount,
        teachers: pendingTeachersCount,
      },
    };
  }

  /**
   * Update student or teacher registration status (Verified / Rejected)
   */
  async updateRegistrationStatus(id, role, status) {
    if (!['Verified', 'Rejected'].includes(status)) {
      const error = new Error('Invalid status. Must be Verified or Rejected.');
      error.statusCode = 400;
      throw error;
    }

    if (role === 'student') {
      const student = await Student.findById(id);
      if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
      }
      student.status = status;
      await student.save();
      const obj = student.toObject();
      delete obj.password;
      return { ...obj, role: 'student' };
    } else if (role === 'teacher') {
      const teacher = await Teacher.findById(id);
      if (!teacher) {
        const error = new Error('Teacher not found');
        error.statusCode = 404;
        throw error;
      }
      teacher.status = status;
      await teacher.save();
      const obj = teacher.toObject();
      delete obj.password;
      return { ...obj, role: 'teacher' };
    } else {
      const error = new Error('Invalid role specified');
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Fetch all students across the entire system with search, filter, and pagination
   */
  async getAllStudents(query = {}) {
    const { search, status, grade } = query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (grade && grade !== 'all') filter.class = grade;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { school: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter).select('-password').sort({ createdAt: -1 }).lean();
    return students.map(s => ({ ...s, grade: s.class }));
  }

  /**
   * Fetch details for a specific student including bookings and payment records
   */
  async getStudentDetails(studentId) {
    const student = await Student.findById(studentId).select('-password').lean();
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    student.grade = student.class;

    const [bookings, payments] = await Promise.all([
      Booking.find({ studentId }).populate('teacherId', 'fullName email phone profilePhoto').sort({ createdAt: -1 }).lean(),
      Payment.find({ studentId }).sort({ createdAt: -1 }).lean(),
    ]);

    return { student, bookings, payments };
  }

  /**
   * Fetch all teachers across the entire system with search, filter, and pagination
   */
  async getAllTeachers(query = {}) {
    const { search, status, subject, teachingMode } = query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (teachingMode && teachingMode !== 'all') filter.teachingMode = teachingMode;
    if (subject && subject !== 'all') filter.subjects = { $in: [subject] };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } },
      ];
    }

    const teachers = await Teacher.find(filter).select('-password').sort({ createdAt: -1 }).lean();
    return teachers.map(t => ({ ...t, name: t.fullName }));
  }

  /**
   * Fetch details for a specific teacher including bookings and assigned students
   */
  async getTeacherDetails(teacherId) {
    const teacher = await Teacher.findById(teacherId).select('-password').lean();
    if (!teacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      throw error;
    }
    teacher.name = teacher.fullName;

    const bookings = await Booking.find({ teacherId }).populate('studentId', 'name email phone class').sort({ createdAt: -1 }).lean();

    return { teacher, bookings };
  }

  /**
   * Get pending bookings requiring admin confirmation
   */
  async getPendingBookings() {
    return await Booking.find({ status: 'Pending' })
      .populate('studentId', 'name email phone class school profilePhoto')
      .populate('teacherId', 'fullName email phone profilePhoto')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Confirm (Approve) or Reject (Cancel) a booking
   */
  async confirmOrRejectBooking(bookingId, status) {
    if (!['Approved', 'Cancelled'].includes(status)) {
      const error = new Error('Invalid status. Must be Approved or Cancelled.');
      error.statusCode = 400;
      throw error;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    booking.status = status;
    await booking.save();
    return booking;
  }

  /**
   * Fetch all bookings across the entire system with filters
   */
  async getAllBookings(query = {}) {
    const { search, studentId, teacherId, status, date } = query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (teacherId) filter.teacherId = teacherId;
    if (status && status !== 'all') filter.status = status;
    if (date) filter.date = date;

    let bookings = await Booking.find(filter)
      .populate('studentId', 'name email phone class profilePhoto')
      .populate('teacherId', 'fullName email phone profilePhoto')
      .sort({ createdAt: -1 })
      .lean();

    if (search) {
      const s = search.toLowerCase();
      bookings = bookings.filter(b => 
        b.studentId?.name?.toLowerCase().includes(s) ||
        b.studentId?.email?.toLowerCase().includes(s) ||
        b.teacherId?.fullName?.toLowerCase().includes(s) ||
        b.teacherId?.email?.toLowerCase().includes(s) ||
        b.subject?.toLowerCase().includes(s)
      );
    }

    return bookings;
  }
}

export default new AdminService();
