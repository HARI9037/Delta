import paymentService from '../services/payment.service.js';
import responseHelper from '../utils/response.js';

class PaymentController {
  async getPayments(req, res) {
    try {
      const payments = await paymentService.getPayments(req.user._id);
      return responseHelper.success(res, 200, 'Payments fetched successfully', payments);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to fetch payments',
        error.message
      );
    }
  }

  async uploadReceipt(req, res) {
    try {
      const payment = await paymentService.uploadReceipt(req.user._id, req.body);
      return responseHelper.success(res, 201, 'Receipt uploaded successfully', payment);
    } catch (error) {
      return responseHelper.error(
        res,
        error.statusCode || 400,
        error.message || 'Failed to upload receipt',
        error.message
      );
    }
  }
}

export default new PaymentController();
