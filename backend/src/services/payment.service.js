import Payment from '../models/payment.model.js';

class PaymentService {
  async getPayments(studentId) {
    const payments = await Payment.find({ studentId }).sort({ createdAt: -1 });
    return payments;
  }

  async uploadReceipt(studentId, paymentData) {
    const { month, year, amount, receipt } = paymentData;

    if (!month || !year || !amount || !receipt) {
      const error = new Error('Month, year, amount, and receipt are required');
      error.statusCode = 400;
      throw error;
    }

    // Check if a payment for this month and year already exists
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
        receipt,
        status: 'Uploaded',
      });
    }

    return payment;
  }
}

export default new PaymentService();
