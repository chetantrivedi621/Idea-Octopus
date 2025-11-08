import express from 'express'
import Announcement from '../models/Announcement.js'

const router = express.Router()

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ timestamp: -1 })
    res.json(announcements)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create announcement
router.post('/', async (req, res) => {
  try {
    const announcement = new Announcement(req.body)
    await announcement.save()
    res.status(201).json(announcement)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete announcement
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id)
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' })
    }
    res.json({ message: 'Announcement deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

