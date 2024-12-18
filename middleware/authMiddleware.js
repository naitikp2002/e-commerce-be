const jwt = require('jsonwebtoken');
const db = require('../models/index');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach user data to request
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRole };
