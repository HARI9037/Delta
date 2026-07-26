const responseHelper = {
  success: (res, statusCode = 200, message = 'Success', data = {}) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error: (res, statusCode = 500, message = 'Internal Server Error', error = null) => {
    // Log the detailed error internally
    if (error) {
      console.error(`[ERROR LOG] ${message}:`, error);
    }
    return res.status(statusCode).json({
      success: false,
      message,
    });
  },
};

export default responseHelper;
