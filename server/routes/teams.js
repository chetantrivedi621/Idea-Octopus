import express from 'express'
import Team from '../models/Team.js'

const router = express.Router()

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 })
    res.json(teams)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single team
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }
    res.json(team)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create team
router.post('/', async (req, res) => {
  try {
    const team = new Team(req.body)
    await team.save()
    res.status(201).json(team)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router

