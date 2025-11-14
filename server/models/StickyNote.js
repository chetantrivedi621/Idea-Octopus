import mongoose from 'mongoose'

const stickyNoteSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  noteId: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    default: ''
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    default: '#FFE66D'
  },
  width: {
    type: Number,
    default: 200
  },
  height: {
    type: Number,
    default: 150
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

// Update updatedAt before saving
stickyNoteSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date()
  }
  next()
})

// Index for faster queries
stickyNoteSchema.index({ teamId: 1, noteId: 1 })

const StickyNote = mongoose.model('StickyNote', stickyNoteSchema)

export default StickyNote

