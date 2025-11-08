import mongoose from 'mongoose'

const scoreSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  judgeId: {
    type: String,
    required: true
  },
  scores: {
    innovation: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    technical: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    presentation: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    problemSolving: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  totalScore: {
    type: Number,
    default: 0
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

scoreSchema.pre('save', function(next) {
  this.totalScore = this.scores.innovation + this.scores.technical + 
                   this.scores.presentation + this.scores.problemSolving
  this.updatedAt = Date.now()
  next()
})

const Score = mongoose.model('Score', scoreSchema)

export default Score

