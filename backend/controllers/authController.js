// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// // Generate JWT Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE,
//   });
// };


// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // validation
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please add all fields'
//       });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: 'Password must be at least 6 characters'
//       });
//     }

//     // Check if user exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists with this email'
//       });
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password,
//     });

//     if (user) {
//       res.status(201).json({
//         success: true,
//         message: 'User registered successfully',
//         data: {
//           _id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           token: generateToken(user._id),
//         },
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         message: 'Invalid user data'
//       });
//     }
//   } catch (error) {
//     console.error('Register error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during registration'
//     });
//   }
// };


// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please add email and password'
//       });
//     }

//     // Check for user
//     const user = await User.findOne({ email });

//     if (user && (await user.matchPassword(password))) {
//       res.json({
//         success: true,
//         message: 'Login successful',
//         data: {
//           _id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           token: generateToken(user._id),
//         },
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during login'
//     });
//   }
// };


// const getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
    
//     res.json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };


// const updateProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     if (user) {
//       user.name = req.body.name || user.name;
//       user.email = req.body.email || user.email;

//       if (req.body.password) {
//         user.password = req.body.password;
//       }

//       const updatedUser = await user.save();

//       res.json({
//         success: true,
//         message: 'Profile updated successfully',
//         data: {
//           _id: updatedUser._id,
//           name: updatedUser.name,
//           email: updatedUser.email,
//           role: updatedUser.role,
//           token: generateToken(updatedUser._id),
//         },
//       });
//     } else {
//       res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }
//   } catch (error) {
//     console.error('Update profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser,
//   getProfile,
//   updateProfile,
// };

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Create JWT token for user
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are filled
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields'
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and check password
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    // Get user data without password
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      // Update user fields
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          token: generateToken(updatedUser._id),
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Export all functions
module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
};