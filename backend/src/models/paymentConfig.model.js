import mongoose from 'mongoose';

/**
 * PaymentConfig — singleton document that holds the global payment settings.
 * Only one document should exist; use PaymentConfig.getConfig() to read it.
 * Admin can update: defaultAmount, currency, dueDay, requiresVerification, description.
 */
const paymentConfigSchema = new mongoose.Schema(
  {
    defaultAmount: {
      type: Number,
      default: 500,
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    dueDay: {
      type: Number,
      default: 5,
      min: 1,
      max: 28,
    },
    // If false → payments are auto-verified on "Pay Now".
    // If true  → admin must manually verify each payment.
    requiresVerification: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: 'Monthly Tuition Fee',
      trim: true,
    },
    instituteName: {
      type: String,
      default: 'Delta Tutoring Centre',
      trim: true,
    },
    instituteAddress: {
      type: String,
      default: 'India',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentConfig = mongoose.model('PaymentConfig', paymentConfigSchema);

export default PaymentConfig;
