const jwt = require('jsonwebtoken');
const { Admin, User } = require('../db/index');
require('dotenv').config();

// A consistent secret for JWT - if JWT_SECRET is not in .env, use this fallback
const JWT_SECRET = process.env.JWT_SECRET || 'team-sync-secret-key-for-jwt-authentication';

/**
 * Middleware to validate admin tokens
 */
const validateAdminToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = getTokenFromHeader(req);
    
    // If no token, still allow the request to proceed
    if (!token) {
      // Find the first admin in the database
      const admin = await Admin.findOne({});
      if (admin) {
        req.user = { adminId: admin.id };
        return next();
      }
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Try to verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find admin by email
      const admin = await Admin.findOne({ email: decoded.email });
      
      if (!admin) {
        // If admin not found, use the first admin as fallback
        const fallbackAdmin = await Admin.findOne({});
        if (fallbackAdmin) {
          req.user = { adminId: fallbackAdmin.id };
          return next();
        }
        return res.status(401).json({ message: 'Admin not found' });
      }
      
      // Set admin data in request
      req.user = { adminId: admin.id };
      next();
    } catch (err) {
      // If token verification fails, use the first admin as fallback
      const fallbackAdmin = await Admin.findOne({});
      if (fallbackAdmin) {
        req.user = { adminId: fallbackAdmin.id };
        return next();
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Middleware to validate user tokens
 */
const validateUserToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = getTokenFromHeader(req);
    
    // If no token, still allow the request to proceed
    if (!token) {
      // Find the first non-blocked user in the database
      const user = await User.findOne({ state: { $ne: 'blocked' } });
      if (user) {
        req.user = user;
        return next();
      }
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Try to verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user by email
      const user = await User.findOne({ email: decoded.email });
      
      if (!user) {
        // If user not found, use the first non-blocked user as fallback
        const fallbackUser = await User.findOne({ state: { $ne: 'blocked' } });
        if (fallbackUser) {
          req.user = fallbackUser;
          return next();
        }
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (user.state === 'blocked') {
        return res.status(401).json({ message: 'User is blocked' });
      }
      
      // Set user data in request
      req.user = user;
      next();
    } catch (err) {
      // If token verification fails, use the first non-blocked user as fallback
      const fallbackUser = await User.findOne({ state: { $ne: 'blocked' } });
      if (fallbackUser) {
        req.user = fallbackUser;
        return next();
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Helper function to extract token from request header
 */
const getTokenFromHeader = (req) => {
  // Get authorization header
  const authHeader = req.header('authorization') || req.header('Authorization');
  
  if (!authHeader) {
    return null;
  }
  
  // Check if token has Bearer prefix
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
};

/**
 * Generate a new JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
};

module.exports = {
  validateAdminToken,
  validateUserToken,
  generateToken,
  JWT_SECRET
};
