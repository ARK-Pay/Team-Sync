const jwt = require('jsonwebtoken');
const { Admin, User } = require('../db/index');
require('dotenv').config();

// A consistent secret for JWT - if JWT_SECRET is not in .env, use this fallback
const JWT_SECRET = process.env.JWT_SECRET || 'team-sync-secret-key-for-jwt-authentication';
// Separate secret for refresh tokens
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'team-sync-refresh-token-secret-key';

/**
 * Middleware to validate admin tokens
 */
const validateAdminToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = getTokenFromHeader(req);
    
    // If no token, return unauthorized
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Try to verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find admin by email
      const admin = await Admin.findOne({ email: decoded.email });
      
      if (!admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }
      
      // Set admin data in request
      req.user = { adminId: admin.id };
      next();
    } catch (err) {
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
    
    // If no token, return unauthorized
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Try to verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user by email
      const user = await User.findOne({ email: decoded.email });
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (user.state === 'blocked') {
        return res.status(401).json({ message: 'User is blocked' });
      }
      
      // Set user data in request
      req.user = user;
      next();
    } catch (err) {
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
 * Generate a new JWT access token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Reduced from 12h to 1h for security
};

/**
 * Generate a new refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

/**
 * Save refresh token to user in database
 */
const saveRefreshToken = async (userId, refreshToken) => {
  try {
    // Calculate expiry date (7 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    // Update user with refresh token
    await User.findOneAndUpdate(
      { id: userId },
      { 
        refresh_token: refreshToken,
        refresh_token_expires: expiryDate
      }
    );
    return true;
  } catch (error) {
    console.error('Error saving refresh token:', error);
    return false;
  }
};

/**
 * Verify refresh token and issue new access token
 */
const verifyRefreshToken = async (refreshToken) => {
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    
    // Find user by ID
    const user = await User.findOne({ 
      id: decoded.user_id,
      refresh_token: refreshToken,
      refresh_token_expires: { $gt: new Date() } // Check if token is not expired
    });
    
    if (!user) {
      return { success: false, message: 'Invalid refresh token' };
    }
    
    // Generate new access token
    const accessToken = generateToken({ email: user.email, user_id: user.id });
    
    return { 
      success: true, 
      accessToken,
      user: {
        name: user.name,
        email: user.email,
        teamsync_email: user.teamsync_email
      }
    };
  } catch (error) {
    return { success: false, message: 'Invalid refresh token' };
  }
};

/**
 * Invalidate refresh token (logout)
 */
const invalidateRefreshToken = async (userId) => {
  try {
    await User.findOneAndUpdate(
      { id: userId },
      { 
        refresh_token: null,
        refresh_token_expires: null
      }
    );
    return true;
  } catch (error) {
    console.error('Error invalidating refresh token:', error);
    return false;
  }
};

module.exports = {
  validateAdminToken,
  validateUserToken,
  generateToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  invalidateRefreshToken,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET
};
