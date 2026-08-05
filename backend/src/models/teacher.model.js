import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const teacherSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    qualification: {
      type: String,
      trim: true,
      default: '',
    },
    subjects: {
      type: [String],
      default: [],
    },
    teachingExperience: {
      type: String,
      trim: true,
      default: '',
    },
    teachingMode: {
      type: String,
      enum: ['Online', 'Offline', 'Both'],
      default: 'Both',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Verified',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['teacher', 'admin'],
      default: 'teacher',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
teacherSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare candidate password with stored hash
teacherSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
