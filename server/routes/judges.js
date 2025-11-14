import express from 'express'
import Team from '../models/Team.js'
import PPT from '../models/PPT.js'
import Score from '../models/Score.js'
import User from '../models/User.js'
import { Decks } from '../models.js'

const router = express.Router()

// Get submission for a team (by team name)
router.get('/team/:teamName', async (req, res) => {
  try {
    const teamName = decodeURIComponent(req.params.teamName)
    
    // Find team by name
    const team = await Team.findOne({ name: { $regex: new RegExp(`^${teamName}$`, 'i') } })
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }
    
    // Get PPT for this team
    const ppt = await PPT.findOne({ teamId: team._id }).sort({ uploadDate: -1 })
    
    // Get latest score
    const score = await Score.findOne({ teamId: team._id }).sort({ updatedAt: -1 })
    
    // Also check for deck in new system
    const deck = await Decks.findOne({ teamName: { $regex: new RegExp(`^${teamName}$`, 'i') } })
      .sort({ createdAt: -1 })
    
    res.json({
      team: {
        id: team._id,
        name: team.name,
        description: team.description,
        category: team.category
      },
      ppt: ppt ? {
        id: ppt._id,
        fileName: ppt.fileName,
        fileSize: ppt.fileSize,
        uploadDate: ppt.uploadDate
      } : null,
      deck: deck ? {
        id: deck._id,
        filename: deck.filename,
        size: deck.size,
        createdAt: deck.createdAt
      } : null,
      score: score ? {
        totalScore: score.totalScore,
        scores: score.scores,
        updatedAt: score.updatedAt
      } : null
    })
  } catch (error) {
    console.error('Error fetching team submission:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all judges
router.get('/', async (req, res) => {
  try {
    const judges = await User.find({ role: 'Judge' })
      .select('-password')
      .sort({ createdAt: -1 })
    
    // Format judges with status (default to Active for now)
    const formattedJudges = judges.map(judge => ({
      id: judge._id,
      name: judge.name,
      email: judge.email,
      status: 'Active' // Default status, can be enhanced later
    }))
    
    res.json(formattedJudges)
  } catch (error) {
    console.error('Error fetching judges:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create a new judge
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }
    
    // Create new judge user
    const judge = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'Judge'
    })
    
    await judge.save()
    
    // Return judge without password
    res.status(201).json({
      id: judge._id,
      name: judge.name,
      email: judge.email,
      status: 'Active'
    })
  } catch (error) {
    console.error('Error creating judge:', error)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }
    res.status(500).json({ error: error.message })
  }
})

// Delete a judge
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const judge = await User.findOne({ _id: id, role: 'Judge' })
    if (!judge) {
      return res.status(404).json({ error: 'Judge not found' })
    }
    
    await User.findByIdAndDelete(id)
    
    res.json({ message: 'Judge deleted successfully' })
  } catch (error) {
    console.error('Error deleting judge:', error)
    res.status(500).json({ error: error.message })
  }
})

// Judge scoring endpoint
router.post('/score', async (req, res) => {
  try {
    const { teamName, judgeName, score, comment } = req.body
    
    if (!teamName || !judgeName) {
      return res.status(400).json({ error: 'teamName and judgeName are required' })
    }
    
    // Find team by name
    const team = await Team.findOne({ name: { $regex: new RegExp(`^${teamName}$`, 'i') } })
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }
    
    // Find or create score for this team and judge
    let existingScore = await Score.findOne({ teamId: team._id, judgeId: judgeName })
    
    if (existingScore) {
      // Update existing score
      // If score is provided as a number, distribute it across categories
      // Otherwise, expect scores object with innovation, technical, presentation, problemSolving
      if (typeof score === 'number') {
        // Distribute score evenly across categories (simplified)
        existingScore.scores.innovation = Math.min(10, score / 4)
        existingScore.scores.technical = Math.min(10, score / 4)
        existingScore.scores.presentation = Math.min(5, score / 4)
        existingScore.scores.problemSolving = Math.min(5, score / 4)
      } else if (typeof score === 'object') {
        // Update with provided scores object
        existingScore.scores = { ...existingScore.scores, ...score }
      }
      await existingScore.save()
      res.json(existingScore)
    } else {
      // Create new score
      let scores = {
        innovation: 0,
        technical: 0,
        presentation: 0,
        problemSolving: 0
      }
      
      if (typeof score === 'number') {
        scores.innovation = Math.min(10, score / 4)
        scores.technical = Math.min(10, score / 4)
        scores.presentation = Math.min(5, score / 4)
        scores.problemSolving = Math.min(5, score / 4)
      } else if (typeof score === 'object') {
        scores = { ...scores, ...score }
      }
      
      const newScore = new Score({
        teamId: team._id,
        judgeId: judgeName,
        scores: scores
      })
      await newScore.save()
      res.status(201).json(newScore)
    }
  } catch (error) {
    console.error('Error saving judge score:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

