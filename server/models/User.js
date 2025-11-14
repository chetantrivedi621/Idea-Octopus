import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: function() {
      // Email is required for all roles except Student (teams)
      return this.role !== 'Student'
    },
    unique: true,
    sparse: true, // Allows multiple null values but enforces uniqueness when present
    lowercase: true,
    trim: true
  },
  // Team ID for team-based authentication (used instead of email for teams)
  teamIdString: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values but enforces uniqueness when present
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['Student', 'Organizing Team', 'Judge', 'Visitor'],
    default: 'Student'
  },
  // Team-based fields for hackathon teams
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  teamRole: {
    type: String,
    enum: ['leader', 'member'],
    default: 'member'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next()
  }
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Update updatedAt before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

const User = mongoose.model('User', userSchema)

export default User

