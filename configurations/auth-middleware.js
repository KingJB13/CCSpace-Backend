import jwt from 'jsonwebtoken'
import jwtSecret from './constants.js'

export default class AuthMiddleware {
  static authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided' });

    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user;
      next();
    });
  }

  static authorizeAdmin(req, res, next) {
    if (req.user.position !== 'Dean' || req.user.position !== 'Chairperson') {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
    }

    next();
  }

  static authorizeUser(req, res, next) {
    if (req.user.position !== 'Instructor' || req.user.position !== 'Dean' || req.user.position !== 'Chairperson') {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
    }

    next();
  }
}


