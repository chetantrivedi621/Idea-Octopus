import express from 'express'
import Idea from '../models/Idea.js'

const router = express.Router()

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
      req.body,
      { new: true, runValidators: true }
    ).populate('teamId')
    
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' })
    }
    
    res.json(idea)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router

