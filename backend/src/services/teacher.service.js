import jwt from 'jsonwebtoken';
import Teacher from '../models/teacher.model.js';
import Availability from '../models/availability.model.js';
import Booking from '../models/booking.model.js';
import Notification from '../models/notification.model.js';
// Student model import for future query integration
import Student from '../models/student.model.js';

// Local timezone date as "YYYY-MM-DD" (matches date strings from <input type="date">)
function localDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

class TeacherService {
  /**
   * Register a new teacher
   */
  async registerTeacher(teacherData) {
    const { email } = teacherData;

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      const error = new Error('Email is already registered');
      error.statusCode = 400;
      throw error;
    }

    const teacher = await Teacher.create(teacherData);
    const teacherObj = teacher.toObject();
    delete teacherObj.password;

    const token = jwt.sign(
      { id: teacher._id, role: teacher.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { teacher: teacherObj, token };
  }

  /**
   * Authenticate teacher and issue JWT token
   */
  async loginTeacher(email, password) {
    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      throw error;
    }

    const teacher = await Teacher.findOne({ email }).select('+password');
    if (!teacher) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!teacher.active) {
      const error = new Error('Account is deactivated. Please contact administration');
      error.statusCode = 403;
      throw error;
    }

    if (teacher.status !== 'Verified') {
      const error = new Error(`Account status is ${teacher.status}. Only verified accounts can log in`);
      error.statusCode = 403;
      throw error;
    }

    const token = jwt.sign(
      { id: teacher._id, role: teacher.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const teacherObj = teacher.toObject();
    delete teacherObj.password;

    return { teacher: teacherObj, token };
  }

  /**
   * Fetch teacher profile by ID
   */
  async getTeacherProfile(teacherId) {
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) {
      const error = new Error('Teacher profile not found');
      error.statusCode = 404;
      throw error;
    }
    teacher.name = teacher.fullName;
    return teacher;
  }

  /**
   * Update editable fields of teacher profile
   */
  async updateTeacherProfile(teacherId, updateData) {
    const { name, fullName, phone, qualification, teachingExperience, teachingMode, profilePhoto, password, bio, subjects } = updateData;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      const error = new Error('Teacher profile not found');
      error.statusCode = 404;
      throw error;
    }

    if (name !== undefined) teacher.fullName = name;
    if (fullName !== undefined) teacher.fullName = fullName;
    if (phone !== undefined) teacher.phone = phone;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (teachingExperience !== undefined) teacher.teachingExperience = teachingExperience;
    if (teachingMode !== undefined) teacher.teachingMode = teachingMode;
    if (profilePhoto !== undefined) teacher.profilePhoto = profilePhoto;
    if (bio !== undefined) teacher.bio = bio;
    if (subjects !== undefined) teacher.subjects = subjects;
    if (password) teacher.password = password; // Triggers pre-save password hash hook

    await teacher.save();

    const teacherObj = teacher.toObject();
    delete teacherObj.password;
    teacherObj.name = teacherObj.fullName;

    return teacherObj;
  }

  /**
   * Persist an uploaded profile photo for a teacher
   */
  async uploadProfilePhoto(teacherId, file) {
    if (!file) {
      const error = new Error('No photo file provided');
      error.statusCode = 400;
      throw error;
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      const error = new Error('Teacher profile not found');
      error.statusCode = 404;
      throw error;
    }

    teacher.profilePhoto = `/api/uploads/${file.filename}`;
    await teacher.save();

    const teacherObj = teacher.toObject();
    delete teacherObj.password;
    teacherObj.name = teacherObj.fullName;

    return teacherObj;
  }

  /**
   * Fetch assigned students for the teacher
   */
  async getAssignedStudents(teacherId) {
    const bookings = await Booking.find({ teacherId, status: 'Approved' }).distinct('studentId');
    const students = await Student.find({ _id: { $in: bookings } }).select('-password').lean();
    return students.map((s) => ({ ...s, grade: s.class }));
  }

  /**
   * Send a notification to a student (e.g. asking them to add their correct grade/class)
   */
  async notifyStudent(teacherId, studentId, message) {
    if (!studentId) {
      const error = new Error('Student ID is required');
      error.statusCode = 400;
      throw error;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }

    const booking = await Booking.findOne({ teacherId, studentId, status: 'Approved' });
    if (!booking) {
      const error = new Error('You can only notify students who are assigned to your classes');
      error.statusCode = 403;
      throw error;
    }

    const notification = await Notification.create({
      studentId,
      teacherId,
      message: message || 'Please add your correct class or grade in your profile so we can match you with the right teacher.',
    });

    return notification;
  }

  /**
   * Get Teacher Dashboard Data
   */
  async getDashboard(teacherId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = localDateStr();
    const tomorrowStr = localDateStr(tomorrow);

    const [todaysBookings, upcomingClasses, availability, assignedStudents, allBookings] = await Promise.all([
      Booking.find({
        teacherId,
        date: todayStr,
        status: 'Approved'
      }).populate('studentId', 'name email phone'),

      Booking.find({
        teacherId,
        date: { $gte: tomorrowStr },
        status: 'Approved'
      }).sort({ date: 1, startTime: 1 }).limit(5).populate('studentId', 'name email phone'),

      Availability.find({ teacherId, date: todayStr, enabled: true }).sort({ startTime: 1 }),
      
      this.getAssignedStudents(teacherId),

      Booking.find({
        teacherId,
        status: 'Approved',
        date: { $gte: todayStr }
      })
    ]);

    // Timetable is generated only when the availability is entirely closed
    const allAvailability = await Availability.find({ teacherId, date: { $gte: todayStr } }).sort({ date: 1, startTime: 1 });
    const hasOpenSlots = allAvailability.some(slot => slot.enabled !== false);
    const timetable = {};

    if (!hasOpenSlots && allAvailability.length > 0) {
      allAvailability.forEach(slot => {
        if (!timetable[slot.date]) {
          timetable[slot.date] = [];
        }
        const slotBookings = allBookings.filter(b => b.availabilityId.toString() === slot._id.toString());
        timetable[slot.date].push({
          ...slot.toObject(),
          isBooked: slotBookings.length > 0,
          bookings: slotBookings
        });
      });
    }

    return {
      todaysClasses: todaysBookings,
      upcomingClasses,
      availability,
      totalStudents: assignedStudents.length,
      activeSlots: availability.length,
      assignedStudents,
      timetable
    };
  }

  /**
   * Helper function to convert "HH:MM" time string to minutes from midnight
   */
  _timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Helper function to check for overlapping time slots
   */
  _hasOverlap(slot1Start, slot1End, slot2Start, slot2End) {
    const start1 = this._timeToMinutes(slot1Start);
    const end1 = this._timeToMinutes(slot1End);
    const start2 = this._timeToMinutes(slot2Start);
    const end2 = this._timeToMinutes(slot2End);

    return start1 < end2 && start2 < end1;
  }

  /**
   * Get all availability slots for a teacher
   */
  async getAvailability(teacherId) {
    const todayStr = localDateStr();
    return await Availability.find({ teacherId, date: { $gte: todayStr } }).sort({ date: 1, startTime: 1 });
  }

  /**
   * Add a new availability slot
   */
  async addAvailability(teacherId, slotData) {
    const { subject, date, startTime, endTime, mode, enabled } = slotData;

    if (!subject || !date || !startTime || !endTime || !mode) {
      const error = new Error('subject, date, startTime, endTime, and mode are required');
      error.statusCode = 400;
      throw error;
    }

    if (this._timeToMinutes(startTime) >= this._timeToMinutes(endTime)) {
      const error = new Error('startTime must be earlier than endTime');
      error.statusCode = 400;
      throw error;
    }

    // Check for overlapping slots on the same date for this teacher
    const existingSlots = await Availability.find({ teacherId, date });
    for (const slot of existingSlots) {
      if (this._hasOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
        const error = new Error(`Time slot overlaps with existing slot (${slot.startTime} - ${slot.endTime}) on ${date}`);
        error.statusCode = 400;
        throw error;
      }
    }

    const newSlot = await Availability.create({
      teacherId,
      subject,
      date,
      startTime,
      endTime,
      mode,
      enabled: enabled !== undefined ? enabled : true,
    });

    return newSlot;
  }

  /**
   * Update an existing availability slot
   */
  async updateAvailability(teacherId, slotId, updateData) {
    const slot = await Availability.findById(slotId);
    if (!slot) {
      const error = new Error('Availability slot not found');
      error.statusCode = 404;
      throw error;
    }

    if (slot.teacherId.toString() !== teacherId.toString()) {
      const error = new Error('Unauthorized to modify this availability slot');
      error.statusCode = 403;
      throw error;
    }

    const subject = updateData.subject || slot.subject;
    const date = updateData.date || slot.date;
    const startTime = updateData.startTime || slot.startTime;
    const endTime = updateData.endTime || slot.endTime;
    const mode = updateData.mode || slot.mode;

    if (this._timeToMinutes(startTime) >= this._timeToMinutes(endTime)) {
      const error = new Error('startTime must be earlier than endTime');
      error.statusCode = 400;
      throw error;
    }

    // Check for overlapping slots excluding current slot
    const existingSlots = await Availability.find({
      teacherId,
      date,
      _id: { $ne: slotId },
    });

    for (const otherSlot of existingSlots) {
      if (this._hasOverlap(startTime, endTime, otherSlot.startTime, otherSlot.endTime)) {
        const error = new Error(`Time slot overlaps with existing slot (${otherSlot.startTime} - ${otherSlot.endTime}) on ${date}`);
        error.statusCode = 400;
        throw error;
      }
    }

    if (updateData.subject !== undefined) slot.subject = updateData.subject;
    if (updateData.date !== undefined) slot.date = updateData.date;
    if (updateData.startTime !== undefined) slot.startTime = updateData.startTime;
    if (updateData.endTime !== undefined) slot.endTime = updateData.endTime;
    if (updateData.mode !== undefined) slot.mode = updateData.mode;
    if (updateData.enabled !== undefined) slot.enabled = updateData.enabled;

    await slot.save();
    return slot;
  }


  /**
   * Get all bookings for the teacher (with optional status filter)
   */
  async getBookings(teacherId, status) {
    const query = { teacherId };
    if (status) query.status = status;
    return await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('studentId', 'name email phone');
  }

  /**
   * Delete an availability slot
   */
  async deleteAvailability(teacherId, slotId) {
    const slot = await Availability.findById(slotId);
    if (!slot) {
      const error = new Error('Availability slot not found');
      error.statusCode = 404;
      throw error;
    }

    if (slot.teacherId.toString() !== teacherId.toString()) {
      const error = new Error('Unauthorized to delete this availability slot');
      error.statusCode = 403;
      throw error;
    }

    await slot.deleteOne();
    return { id: slotId };
  }
}

export default new TeacherService();
