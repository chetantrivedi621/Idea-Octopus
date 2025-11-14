import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  // GridFS image storage
  banner: {
    type: String, // filename in GridFS
    default: null
  },
  winners: [{
    teamName: String,
    email: String,
    linkedin: String,
    winnerPhoto: String, // filename in GridFS
    position: Number // 1, 2, 3 for 1st, 2nd, 3rd
  }],
  gallery: [{
    type: String // array of filenames in GridFS
  }],
  tags: [{
    type: String
  }],
  memories: [{
    type: String // array of filenames in GridFS
  }],
  rounds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round'
  }],
  // Track which teams participated in this event
  participatingTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  // Track if memory capsule has been created (has winners or memories)
  memoryCapsuleCreated: {
    type: Boolean,
    default: false
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

eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

const Event = mongoose.model('Event', eventSchema)

export default Event

