import express from 'express'
import Idea from '../models/Idea.js'

const router = express.Router()

// Helper function to get io instance from app
const getIO = (req) => {
  return req.app.get('io')
}

// Get all ideas
router.get('/', async (req, res) => {
  try {
    const ideas = await Idea.find().populate('teamId').sort({ createdAt: -1 })
    res.json(ideas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get ideas for a specific team
router.get('/team/:teamId', async (req, res) => {
  try {
    const ideas = await Idea.find({ teamId: req.params.teamId })
      .populate('teamId')
      .sort({ createdAt: -1 })
    res.json(ideas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create idea
router.post('/', async (req, res) => {
  try {
    const idea = new Idea(req.body)
    await idea.save()
    await idea.populate('teamId')
    
    // Emit real-time event to all team members
    const io = getIO(req)
    if (io && idea.teamId) {
      const teamRoom = `team:${idea.teamId._id || idea.teamId}`
      io.to(teamRoom).emit('idea:created', {
        idea: idea.toObject(),
        timestamp: new Date().toISOString()
      })
      console.log(`📢 Broadcasted idea creation to team room: ${teamRoom}`)
    }
    
    res.status(201).json(idea)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update idea (for votes, hearts, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const idea = await Idea.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('teamId')
    
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' })
    }
    
    // Emit real-time event to all team members
    const io = getIO(req)
    if (io && idea.teamId) {
      const teamRoom = `team:${idea.teamId._id || idea.teamId}`
      io.to(teamRoom).emit('idea:updated', {
        ideaId: idea._id,
        idea: idea.toObject(),
        updates: req.body,
        timestamp: new Date().toISOString()
      })
      console.log(`📢 Broadcasted idea update to team room: ${teamRoom}`)
    }
    
    res.json(idea)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// React to an idea (emoji reactions)
router.post('/react/:id', async (req, res) => {
  try {
    const { emoji } = req.body
    const validEmojis = ['fire', 'heart', 'star']
    
    if (!validEmojis.includes(emoji)) {
      return res.status(400).json({ error: 'Invalid emoji. Use: fire, heart, or star' })
    }
    
    const idea = await Idea.findById(req.params.id)
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' })
    }
    
    // Increment the corresponding emoji count
    if (emoji === 'fire') idea.fires = (idea.fires || 0) + 1
    if (emoji === 'heart') idea.hearts = (idea.hearts || 0) + 1
    if (emoji === 'star') idea.stars = (idea.stars || 0) + 1
    
    await idea.save()
    await idea.populate('teamId')
    
    // Emit real-time reaction event to all team members
    const io = getIO(req)
    if (io && idea.teamId) {
      const teamRoom = `team:${idea.teamId._id || idea.teamId}`
      io.to(teamRoom).emit('idea:reacted', {
        ideaId: idea._id,
        idea: idea.toObject(),
        reactionType: emoji,
        timestamp: new Date().toISOString()
      })
      console.log(`📢 Broadcasted idea reaction (${emoji}) to team room: ${teamRoom}`)
    }
    
    res.json(idea)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete idea
router.delete('/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id)
    
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' })
    }
    
    await idea.deleteOne()
    
    // Emit real-time event to all team members
    const io = getIO(req)
    if (io && idea.teamId) {
      const teamRoom = `team:${idea.teamId._id || idea.teamId}`
      io.to(teamRoom).emit('idea:deleted', {
        ideaId: idea._id,
        timestamp: new Date().toISOString()
      })
      console.log(`🗑️ Broadcasted idea deletion to team room: ${teamRoom}`)
    }
    
    res.json({ message: 'Idea deleted successfully', ideaId: idea._id })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get top ideas (sorted by reactions/votes)
router.get('/top', async (req, res) => {
  try {
    // Get ideas sorted by total reactions (fires + hearts + stars)
    const ideas = await Idea.find()
      .populate('teamId')
      .sort({ 
        fires: -1, 
        hearts: -1, 
        stars: -1,
        votes: -1,
        createdAt: -1 
      })
      .limit(10)
    
    // Transform to match frontend expectations
    const transformed = ideas.map(idea => ({
      _id: idea._id,
      teamName: idea.teamId?.name || 'Unknown Team',
      title: idea.title,
      description: idea.description,
      emojiCounts: {
        fire: idea.fires || 0,
        heart: idea.hearts || 0,
        star: idea.stars || 0
      },
      votes: idea.votes || 0,
      createdAt: idea.createdAt
    }))
    
    res.json(transformed)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

