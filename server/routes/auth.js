import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// JWT secret key (should be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Signup route for all user types
router.post('/signup', async (req, res) => {
  try {
    const { name, email, teamId, password, confirmPassword, role } = req.body
    const isTeamRole = role === 'Student'

    // Validation
    if (!name || !password || !confirmPassword || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      })
    }

    // For teams, require Team ID instead of email
    if (isTeamRole && !teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required for team signup'
      })
    }

    // For other roles, require email
    if (!isTeamRole && !email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    // Validate role
    const validRoles = ['Student', 'Organizing Team', 'Judge', 'Visitor']
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: Student, Organizing Team, Judge, Visitor'
      })
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      })
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      })
    }

    // Check if user already exists
    if (isTeamRole) {
      // For teams, check by Team ID
      const existingUser = await User.findOne({ teamIdString: teamId.toLowerCase().trim() })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Team with this Team ID already exists'
        })
      }

      // Check if Team exists and create/link it
      const Team = (await import('../models/Team.js')).default
      let team = await Team.findOne({ teamId: teamId.toLowerCase().trim() })
      
      if (!team) {
        // Create team if it doesn't exist
        try {
        team = new Team({
          name: name.trim(),
          teamId: teamId.toLowerCase().trim(),
          description: '',
          category: 'General'
        })
        await team.save()
        } catch (teamError) {
          // If team creation fails (e.g., duplicate teamId), try to find it again
          if (teamError.code === 11000) {
            team = await Team.findOne({ teamId: teamId.toLowerCase().trim() })
          } else {
            throw teamError
          }
        }
      }
    } else {
      // For other roles, check by email
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        })
      }
    }

    // Create new user
    const userData = {
      name: name.trim(),
      password,
      role
    }

    if (isTeamRole) {
      userData.teamIdString = teamId.toLowerCase().trim()
      // Link to team document (we already have it from above)
      const Team = (await import('../models/Team.js')).default
      const team = await Team.findOne({ teamId: teamId.toLowerCase().trim() })
      if (team) {
        userData.teamId = team._id
        userData.teamRole = 'leader' // First member is leader
      }
    } else {
      userData.email = email.toLowerCase().trim()
    }

    let user
    try {
      user = new User(userData)
    await user.save()
    } catch (userError) {
      // Handle duplicate key errors
      if (userError.code === 11000) {
        const field = Object.keys(userError.keyPattern)[0]
        if (field === 'email') {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
          })
        } else if (field === 'teamIdString') {
          return res.status(400).json({
            success: false,
            message: 'Team with this Team ID already exists'
          })
        }
      }
      throw userError
    }

    // Generate token
    const token = generateToken(user._id, user.role)

    // Get team info if it's a team user
    let teamInfo = null
    if (isTeamRole && user.teamId) {
      const Team = (await import('../models/Team.js')).default
      const team = await Team.findById(user.teamId)
      if (team) {
        teamInfo = {
          _id: team._id,
          name: team.name,
          teamId: team.teamId,
          description: team.description,
          category: team.category
        }
      }
    }

    // Return user data (without password) and token
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email || null,
          teamIdString: user.teamIdString || null,
          role: user.role,
          teamId: user.teamId || null,
          teamRole: user.teamRole || null,
          createdAt: user.createdAt
        },
        team: teamInfo,
        token
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message).join(', ')
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errors}`
      })
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field'
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      })
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// Login route for all user types
router.post('/login', async (req, res) => {
  try {
    const { email, teamId, password, role } = req.body
    const isTeamLogin = !!teamId

    // Validation
    if (isTeamLogin) {
      if (!teamId || !password) {
        return res.status(400).json({
          success: false,
          message: 'Team ID and password are required'
        })
      }
    } else {
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        })
      }
    }

    // Find user by email or Team ID
    let user = null
    if (isTeamLogin) {
      user = await User.findOne({ teamIdString: teamId.toLowerCase().trim() })
    } else {
      user = await User.findOne({ email: email.toLowerCase().trim() })
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: isTeamLogin ? 'Invalid Team ID or password' : 'Invalid email or password'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: isTeamLogin ? 'Invalid Team ID or password' : 'Invalid email or password'
      })
    }

    // Optional: Verify role matches (if provided)
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This account is registered as ${user.role}, not ${role}`
      })
    }

    // Generate token
    const token = generateToken(user._id, user.role)

    // Populate team information if user belongs to a team
    let teamInfo = null
    if (user.teamId) {
      const Team = (await import('../models/Team.js')).default
      const team = await Team.findById(user.teamId)
      if (team) {
        teamInfo = {
          _id: team._id,
          name: team.name,
          teamId: team.teamId,
          description: team.description,
          category: team.category
        }
      }
    }

    // Return user data (without password) and token
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email || null,
          teamIdString: user.teamIdString || null,
          role: user.role,
          teamId: user.teamId || null,
          teamRole: user.teamRole || null,
          createdAt: user.createdAt
        },
        team: teamInfo,
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    })
  }
})

// Get current user profile (protected route)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email || null,
          teamIdString: user.teamIdString || null,
          role: user.role,
          teamId: user.teamId || null,
          teamRole: user.teamRole || null,
          createdAt: user.createdAt
        }
      }
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
})

export default router

