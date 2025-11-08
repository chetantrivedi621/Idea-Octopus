import mongoose from 'mongoose'

const ideaSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  description: {
    type: String,
    default: ''
  },
  hearts: {
    type: Number,
    default: 0
  },
  fires: {
    type: Number,
    default: 0
  },
  stars: {
    type: Number,
    default: 0
  },
  votes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Idea = mongoose.model('Idea', ideaSchema)

export default Idea

