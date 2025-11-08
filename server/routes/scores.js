import express from 'express'
import Score from '../models/Score.js'
import Team from '../models/Team.js'

const router = express.Router()

// Get all scores
router.get('/', async (req, res) => {
  try {
    const scores = await Score.find().populate('teamId').sort({ totalScore: -1 })
    res.json(scores)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get scores for a specific team
router.get('/team/:teamId', async (req, res) => {
  try {
    const scores = await Score.find({ teamId: req.params.teamId })
      .populate('teamId')
      .sort({ updatedAt: -1 })
    res.json(scores)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get latest score for a team (for leaderboard)
router.get('/team/:teamId/latest', async (req, res) => {
  try {
    const score = await Score.findOne({ teamId: req.params.teamId })
      .populate('teamId')
      .sort({ updatedAt: -1 })
    res.json(score)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create or update score
router.post('/', async (req, res) => {
  try {
    const { teamId, judgeId, scores } = req.body
    
    // Find existing score for this team and judge
    let score = await Score.findOne({ teamId, judgeId })
    
    if (score) {
      // Update existing score
      score.scores = scores
      await score.save()
    } else {
      // Create new score
      score = new Score({ teamId, judgeId, scores })
      await score.save()
    }
    
    res.status(201).json(score)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    // Get latest score for each team
    const teams = await Team.find()
    const leaderboard = await Promise.all(
      teams.map(async (team) => {
        const latestScore = await Score.findOne({ teamId: team._id })
          .sort({ updatedAt: -1 })
        
        return {
          teamId: team._id,
          teamName: team.name,
          teamDescription: team.description,
          category: team.category,
          score: latestScore ? latestScore.totalScore : 0,
          scores: latestScore ? latestScore.scores : null
        }
      })
    )
    
    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score)
    
    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

