import express from 'express'
import Round from '../models/Round.js'

const router = express.Router()

// Get all rounds
router.get('/', async (req, res) => {
  try {
    const rounds = await Round.find().sort({ order: 1 })
    res.json(rounds)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get current active round
router.get('/current', async (req, res) => {
  try {
    const round = await Round.findOne({ status: 'active' })
    res.json(round)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create round
router.post('/', async (req, res) => {
  try {
    const round = new Round(req.body)
    await round.save()
    res.status(201).json(round)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update round
router.patch('/:id', async (req, res) => {
  try {
    const round = await Round.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!round) {
      return res.status(404).json({ error: 'Round not found' })
    }
    
    // If setting a round as active, update other rounds
    if (req.body.status === 'active') {
      await Round.updateMany(
        { _id: { $ne: req.params.id }, status: 'active' },
        { status: 'completed' }
      )
    }
    
    res.json(round)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Set current round
router.post('/:id/activate', async (req, res) => {
  try {
    // Set all other active rounds to completed
    await Round.updateMany(
      { status: 'active' },
      { status: 'completed', endTime: Date.now() }
    )
    
    // Set this round as active
    const round = await Round.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active',
        startTime: req.body.startTime || Date.now()
      },
      { new: true }
    )
    
    if (!round) {
      return res.status(404).json({ error: 'Round not found' })
    }
    
    res.json(round)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router

