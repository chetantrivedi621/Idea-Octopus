import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    default: 'Organizer'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

announcementSchema.virtual('timeAgo').get(function() {
  const now = Date.now()
  const diff = now - this.timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return `${hours} hour${hours > 1 ? 's' : ''} ago`
})

announcementSchema.set('toJSON', { virtuals: true })

const Announcement = mongoose.model('Announcement', announcementSchema)

export default Announcement

