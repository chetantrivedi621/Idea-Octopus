import mongoose from 'mongoose'

const aiSummarySchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  summary: {
    type: String,
    default: ''
  },
  futureScope: {
    type: String,
    default: ''
  },
  feasibility: {
    type: String,
    default: ''
  },
  feasibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  pptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PPT',
    default: null
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

// Update the updatedAt field before saving
aiSummarySchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

const AISummary = mongoose.model('AISummary', aiSummarySchema)

export default AISummary

