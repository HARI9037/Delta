import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    availabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Availability',
      required: [true, 'Availability ID is required'],
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    day: {
      type: String,
      required: [true, 'Day is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Both'],
      required: [true, 'Mode is required'],
    },
    requirement: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
