// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Middleware to protect routes - checks if user is logged in
// const protect = async (req, res, next) => {
//   let token;

//   // Check if authorization header exists and starts with Bearer
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       // Get token from header (format: "Bearer token123")
//       token = req.headers.authorization.split(' ')[1];

//       // Verify token is valid
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Get user data from database (without password)
//       req.user = await User.findById(decoded.id).select('-password');

//       // Move to next middleware or route
//       next();
//     } catch (error) {
//       console.error('Token verification failed:', error);
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token'
//       });
//     }
//   }

//   // If no token found
//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: 'Please login to access this resource'
//     });
//   }
// };

// // Middleware to check if user is admin
// const admin = (req, res, next) => {
//   // Check if user exists and has admin role
//   if (req.user && req.user.role === 'admin') {
//     next();
//   } else {
//     res.status(403).json({
//       success: false,
//       message: 'Admin access required'
//     });
//   }
// };

// // Export middleware functions
// module.exports = { protect, admin };

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check if user is logged in
const protect = async (req, res, next) => {
  let token;

  // Look for token in authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Check if token is valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user in database and remove password from response
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Token error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }

  // If no token was found
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please login to access this resource'
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};


module.exports = { protect, admin };