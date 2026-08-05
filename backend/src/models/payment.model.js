import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    // Payment lifecycle: Pending → (Uploaded →) Verified | Rejected
    status: {
      type: String,
      enum: ['Pending', 'Uploaded', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    // true when admin explicitly verifies, or auto-set on demo pay if requiresVerification=false
    verified: {
      type: Boolean,
      default: false,
    },
    // URL / path of the uploaded receipt image (optional, for Uploaded state)
    receipt: {
      type: String,
      trim: true,
      default: '',
    },
    // Auto-generated fake transaction ID on demo payment
    transactionId: {
      type: String,
      trim: true,
      default: '',
    },
    // Human-readable receipt number (e.g. RCP-2024-0001)
    receiptNumber: {
      type: String,
      trim: true,
      default: '',
    },
    // Timestamp when the student clicked "Pay Now"
    paidAt: {
      type: Date,
      default: null,
    },
    // Admin note on verify/reject
    adminNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
