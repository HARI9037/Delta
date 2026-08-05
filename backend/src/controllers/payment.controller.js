import paymentService from '../services/payment.service.js';
import responseHelper from '../utils/response.js';

class PaymentController {
<<<<<<< Updated upstream
=======
  // ──────────────────────────────────────────────
  // Student endpoints
  // ──────────────────────────────────────────────

  /** GET /payment — student's full payment history */
>>>>>>> Stashed changes
  async getPayments(req, res) {
    try {
      const payments = await paymentService.getPayments(req.user._id);
      return responseHelper.success(res, 200, 'Payments fetched successfully', payments);
    } catch (error) {
<<<<<<< Updated upstream
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to fetch payments',
        error.message
      );
    }
  }

=======
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch payments', error.message);
    }
  }

  /** GET /payment/status — current month's payment record (creates if missing) */
  async getPaymentStatus(req, res) {
    try {
      const result = await paymentService.getOrCreateCurrentMonthPayment(req.user._id);
      return responseHelper.success(res, 200, 'Payment status fetched', result);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch payment status', error.message);
    }
  }

  /** POST /payment/demo-pay — student clicks "Pay Now" */
  async demoPayNow(req, res) {
    try {
      const result = await paymentService.demoPayNow(req.user._id);
      return responseHelper.success(res, 200, 'Payment processed successfully', result);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Payment failed', error.message);
    }
  }

  /** POST /payment/receipt — upload receipt URL (legacy, kept for compatibility) */
>>>>>>> Stashed changes
  async uploadReceipt(req, res) {
    try {
      const payment = await paymentService.uploadReceipt(req.user._id, req.body);
      return responseHelper.success(res, 201, 'Receipt uploaded successfully', payment);
    } catch (error) {
<<<<<<< Updated upstream
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to upload receipt',
        error.message
      );
=======
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to upload receipt', error.message);
    }
  }

  // ──────────────────────────────────────────────
  // Config endpoints (public read, admin write)
  // ──────────────────────────────────────────────

  /** GET /payment/config — public: anyone can read the fee config */
  async getConfig(req, res) {
    try {
      const config = await paymentService.getConfig();
      return responseHelper.success(res, 200, 'Config fetched', config);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch config', error.message);
    }
  }

  /** PUT /payment/config — teacher/admin: update the fee config */
  async updateConfig(req, res) {
    try {
      const config = await paymentService.updateConfig(req.body);
      return responseHelper.success(res, 200, 'Config updated successfully', config);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to update config', error.message);
    }
  }

  // ──────────────────────────────────────────────
  // Admin endpoints (teacher role)
  // ──────────────────────────────────────────────

  /** GET /payment/admin/all — all students' payments */
  async getAllPayments(req, res) {
    try {
      const payments = await paymentService.getAllPayments();
      return responseHelper.success(res, 200, 'All payments fetched', payments);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch payments', error.message);
    }
  }

  /** PUT /payment/admin/:id/verify */
  async verifyPayment(req, res) {
    try {
      const payment = await paymentService.verifyPayment(req.params.id, req.body.adminNote);
      return responseHelper.success(res, 200, 'Payment verified', payment);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to verify payment', error.message);
    }
  }

  /** PUT /payment/admin/:id/reject */
  async rejectPayment(req, res) {
    try {
      const payment = await paymentService.rejectPayment(req.params.id, req.body.adminNote);
      return responseHelper.success(res, 200, 'Payment rejected', payment);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to reject payment', error.message);
>>>>>>> Stashed changes
    }
  }
}

export default new PaymentController();
