import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID is required'],
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
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
      // Format expected: "HH:MM" in 24-hour format
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
      // Format expected: "HH:MM" in 24-hour format
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Both'],
      default: 'Online',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;
