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
    // Auto-update event statuses
    await Event.updateMany(
      { endDate: { $lt: now }, status: { $ne: 'completed' } },
      { status: 'completed' }
    )
    
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

// Get completed events (for organizers)
router.get('/completed', async (req, res) => {
  try {
    const now = new Date()
    // Auto-update event statuses
    await Event.updateMany(
      { endDate: { $lt: now }, status: { $ne: 'completed' } },
      { status: 'completed' }
    )
    
    const events = await Event.find({ 
      status: 'completed'
    })
      .populate('rounds')
      .populate('participatingTeams')
      .sort({ endDate: -1 })
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


// Get events for participant (only events they participated in with memory capsule)
// This route must come before /:id to avoid route conflicts
router.get('/participant/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params
    const now = new Date()
    
    // Auto-update event statuses
    await Event.updateMany(
      { endDate: { $lt: now }, status: { $ne: 'completed' } },
      { status: 'completed' }
    )
    
    // Convert teamId to ObjectId if valid
    const mongoose = await import('mongoose')
    const teamObjectId = mongoose.default.Types.ObjectId.isValid(teamId) 
      ? new mongoose.default.Types.ObjectId(teamId)
      : teamId
    
    // Get events where:
    // 1. The team participated (participatingTeams includes teamId)
    // 2. Event is completed
    // 3. Memory capsule has been created (has winners or memories)
    const events = await Event.find({
      participatingTeams: { $in: [teamObjectId, teamId] },
      status: 'completed',
      $or: [
        { winners: { $exists: true, $ne: [], $size: { $gt: 0 } } },
        { memories: { $exists: true, $ne: [], $size: { $gt: 0 } } },
        { memoryCapsuleCreated: true }
      ]
    })
      .populate('rounds')
      .sort({ endDate: -1 })
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
    
    // Check if memory capsule is being created (winners or memories added)
    if (updateData.winners || updateData.memories) {
      const hasWinners = updateData.winners && updateData.winners.length > 0
      const hasMemories = updateData.memories && updateData.memories.length > 0
      if (hasWinners || hasMemories) {
        updateData.memoryCapsuleCreated = true
      }
    }
    
    // Auto-update status if endDate has passed
    if (updateData.endDate) {
      const now = new Date()
      if (new Date(updateData.endDate) < now) {
        updateData.status = 'completed'
      }
    } else {
      // Check existing event's endDate
      const existingEvent = await Event.findById(req.params.id)
      if (existingEvent && existingEvent.endDate < new Date()) {
        updateData.status = 'completed'
      }
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

// Track team participation in event
router.post('/:id/participate', async (req, res) => {
  try {
    const { teamId } = req.body
    
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' })
    }
    
    const mongoose = await import('mongoose')
    const teamObjectId = mongoose.default.Types.ObjectId.isValid(teamId) 
      ? new mongoose.default.Types.ObjectId(teamId)
      : teamId
    
    const event = await Event.findById(req.params.id)
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    // Convert existing participatingTeams to strings for comparison
    const participatingTeamIds = event.participatingTeams.map(id => 
      id.toString ? id.toString() : id
    )
    const teamIdString = teamObjectId.toString ? teamObjectId.toString() : teamObjectId
    
    // Add team to participating teams if not already present
    if (!participatingTeamIds.includes(teamIdString)) {
      event.participatingTeams.push(teamObjectId)
      await event.save()
    }
    
    const populatedEvent = await Event.findById(event._id).populate('rounds')
    res.json(populatedEvent)
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

