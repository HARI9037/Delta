import Payment from '../models/payment.model.js';
import PaymentConfig from '../models/paymentConfig.model.js';
import Student from '../models/student.model.js';

class PaymentService {
  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────

  /** Get (or create) the singleton config document */
  async getConfig() {
    let config = await PaymentConfig.findOne();
    if (!config) {
      config = await PaymentConfig.create({});
    }
    return config;
  }

  /** Generate a sequential-looking receipt number */
  _generateReceiptNumber() {
    const now = new Date();
    const yy = now.getFullYear();
    const rand = String(Math.floor(Math.random() * 90000) + 10000);
    return `RCP-${yy}-${rand}`;
  }

  /** Generate a fake transaction ID */
  _generateTxnId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = 'TXN';
    for (let i = 0; i < 12; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  // ──────────────────────────────────────────────
  // Student-facing
  // ──────────────────────────────────────────────

  /**
   * Return the current month's payment record for the student.
   * Creates it (status=Pending) if it doesn't exist yet, using the config default amount.
   */
  async getOrCreateCurrentMonthPayment(studentId) {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = String(now.getFullYear());

    let payment = await Payment.findOne({ studentId, month, year });

    if (!payment) {
      const config = await this.getConfig();
      payment = await Payment.create({
        studentId,
        month,
        year,
        amount: config.defaultAmount,
        currency: config.currency,
        status: 'Pending',
        verified: false,
      });
    }

    // Populate student info for the receipt
    const student = await Student.findById(studentId).lean();
    return { payment, student };
  }

  /**
   * Simulate "Pay Now" — marks the payment as Verified (or Uploaded if manual verification is on).
   * Returns the updated payment + student details for receipt rendering.
   */
  async demoPayNow(studentId) {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = String(now.getFullYear());

    const config = await this.getConfig();
    let payment = await Payment.findOne({ studentId, month, year });

    if (!payment) {
      payment = await Payment.create({
        studentId,
        month,
        year,
        amount: config.defaultAmount,
        currency: config.currency,
      });
    }

    const transactionId = this._generateTxnId();
    const receiptNumber = this._generateReceiptNumber();
    const paidAt = new Date();

    if (config.requiresVerification) {
      // Admin must manually verify
      payment.status = 'Uploaded';
      payment.verified = false;
    } else {
      // Auto-verified
      payment.status = 'Verified';
      payment.verified = true;
    }

    payment.transactionId = transactionId;
    payment.receiptNumber = receiptNumber;
    payment.paidAt = paidAt;
    payment.currency = config.currency;
    await payment.save();

    const student = await Student.findById(studentId).lean();
    return { payment, student, config };
  }

  /**
   * Get all past payments for this student (history)
   */
  async getPayments(studentId) {
    const payments = await Payment.find({ studentId }).sort({ createdAt: -1 });
    return payments;
  }

  /**
   * Upload a receipt URL for a payment (legacy method kept for compatibility)
   */
  async uploadReceipt(studentId, paymentData) {
    const { month, year, amount, receipt } = paymentData;

    if (!month || !year || !amount || !receipt) {
      const error = new Error('Month, year, amount, and receipt are required');
      error.statusCode = 400;
      throw error;
    }

    const config = await this.getConfig();
    let payment = await Payment.findOne({ studentId, month, year });

    if (payment) {
      payment.receipt = receipt;
      payment.amount = amount;
      payment.status = 'Uploaded';
      payment.verified = false;
      await payment.save();
    } else {
      payment = await Payment.create({
        studentId,
        month,
        year,
        amount,
        currency: config.currency,
        receipt,
        status: 'Uploaded',
      });
    }

    return payment;
  }

  // ──────────────────────────────────────────────
  // Admin-facing
  // ──────────────────────────────────────────────

  /** Get all payments across all students (populated with student info) */
  async getAllPayments() {
    const payments = await Payment.find()
      .populate('studentId', 'name email class school')
      .sort({ createdAt: -1 })
      .lean();
    return payments;
  }

  /** Admin: manually verify a payment */
  async verifyPayment(paymentId, adminNote = '') {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }
    payment.status = 'Verified';
    payment.verified = true;
    payment.adminNote = adminNote;
    if (!payment.paidAt) payment.paidAt = new Date();
    if (!payment.transactionId) payment.transactionId = this._generateTxnId();
    if (!payment.receiptNumber) payment.receiptNumber = this._generateReceiptNumber();
    await payment.save();
    return payment;
  }

  /** Admin: reject a payment */
  async rejectPayment(paymentId, adminNote = '') {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }
    payment.status = 'Rejected';
    payment.verified = false;
    payment.adminNote = adminNote;
    await payment.save();
    return payment;
  }

  /** Admin: update the global config */
  async updateConfig(updates) {
    const config = await this.getConfig();
    const allowed = ['defaultAmount', 'currency', 'dueDay', 'requiresVerification', 'description', 'instituteName', 'instituteAddress'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        config[key] = updates[key];
      }
    }
    await config.save();
    return config;
  }
}

export default new PaymentService();
