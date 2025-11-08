import express from 'express'
import Event from '../models/Event.js'
import Round from '../models/Round.js'

const router = express.Router()

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('rounds')
      .sort({ startDate: 1 })
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date()
    const events = await Event.find({ 
      endDate: { $gte: now },
      status: { $in: ['upcoming', 'ongoing'] }
    })
      .populate('rounds')
      .sort({ startDate: 1 })
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('rounds')
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    res.json(event)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create event
router.post('/', async (req, res) => {
  try {
    const { name, description, startDate, endDate, location, rounds } = req.body
    
    // Create rounds if provided
    let roundIds = []
    if (rounds && rounds.length > 0) {
      const createdRounds = await Round.insertMany(
        rounds.map((round, index) => ({
          ...round,
          order: round.order || index + 1,
          event: null // Will be updated after event creation
        }))
      )
      roundIds = createdRounds.map(r => r._id)
    }
    
    const event = new Event({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      rounds: roundIds,
      status: new Date(startDate) > new Date() ? 'upcoming' : 'ongoing'
    })
    
    await event.save()
    
    // Update rounds with event reference
    if (roundIds.length > 0) {
      await Round.updateMany(
        { _id: { $in: roundIds } },
        { event: event._id }
      )
    }
    
    const populatedEvent = await Event.findById(event._id).populate('rounds')
    res.status(201).json(populatedEvent)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update event
router.patch('/:id', async (req, res) => {
  try {
    const { rounds, ...updateData } = req.body
    
    // Update rounds if provided
    if (rounds) {
      // Delete old rounds
      const event = await Event.findById(req.params.id)
      if (event && event.rounds.length > 0) {
        await Round.deleteMany({ _id: { $in: event.rounds } })
      }
      
      // Create new rounds
      const createdRounds = await Round.insertMany(
        rounds.map((round, index) => ({
          ...round,
          order: round.order || index + 1,
          event: req.params.id
        }))
      )
      updateData.rounds = createdRounds.map(r => r._id)
    }
    
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate)
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate)
    }
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('rounds')
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    res.json(event)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    // Delete associated rounds
    if (event.rounds.length > 0) {
      await Round.deleteMany({ _id: { $in: event.rounds } })
    }
    
    await Event.findByIdAndDelete(req.params.id)
    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

