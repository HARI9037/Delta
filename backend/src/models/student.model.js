import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
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
    school: {
      type: String,
      trim: true,
      default: '',
    },
    class: {
      type: String,
      trim: true,
      default: '',
    },
    subjects: {
      type: [String],
      default: [],
    },
    parentName: {
      type: String,
      trim: true,
      default: '',
    },
    parentPhone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Verified',
    },
    active: {
      type: Boolean,
      default: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
studentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare candidate password with stored hash
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

export default Student;
