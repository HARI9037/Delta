import jwt from 'jsonwebtoken';
import Student from '../models/student.model.js';
import responseHelper from '../utils/response.js';

const authenticateStudent = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return responseHelper.error(res, 401, 'Access denied. No authentication token provided.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.id);

    if (!student) {
      return responseHelper.error(res, 401, 'Invalid authentication token. User not found.');
    }

    if (!student.active) {
      return responseHelper.error(res, 403, 'Account is deactivated.');
    }

    req.user = student;
    next();
  } catch (error) {
    return responseHelper.error(res, 401, 'Authentication failed', error.message);
  }
};

export {
  authenticateStudent,
};
