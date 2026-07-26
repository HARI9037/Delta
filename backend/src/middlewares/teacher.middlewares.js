import jwt from 'jsonwebtoken';
import Teacher from '../models/teacher.model.js';
import responseHelper from '../utils/response.js';

const authenticateTeacher = async (req, res, next) => {
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
    const teacher = await Teacher.findById(decoded.id);

    if (!teacher) {
      return responseHelper.error(res, 401, 'Invalid authentication token. User not found.');
    }

    if (!teacher.active) {
      return responseHelper.error(res, 403, 'Account is deactivated.');
    }

    req.user = teacher;
    next();
  } catch (error) {
    return responseHelper.error(res, 401, 'Authentication failed', error.message);
  }
};

export {
  authenticateTeacher,
};
