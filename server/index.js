import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { initializeSocket } from './socket.js'
import uploadRouter from './routes/upload.js'
import { jobsRouter } from './routes/jobs.js'
import aiRouter from './routes/ai.js'
import ideaRoutes from './routes/ideas.js'
import eventRoutes from './routes/events.js'
import teamRoutes from './routes/teams.js'
import scoreRoutes from './routes/scores.js'
import roundRoutes from './routes/rounds.js'
import announcementRoutes from './routes/announcements.js'
import pptRoutes from './routes/ppts.js'
import judgeRoutes from './routes/judges.js'
import qrRoutes from './routes/qr.js'
import submissionRoutes from './routes/submissions.js'
import imageRoutes from './routes/images.js'
import authRoutes from './routes/auth.js'
import stickyNoteRoutes from './routes/stickyNotes.js'

dotenv.config()

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '))
  console.error('💡 Please check your .env file in the server directory')
  process.exit(1)
}

// Log configuration (without sensitive data)
console.log('📋 Server Configuration:')
console.log('   - PORT:', process.env.PORT || 8080)
console.log('   - CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:5173')
console.log('   - MONGO_URI:', process.env.MONGO_URI ? 'set ✓' : 'not set ✗')
console.log('   - EXTRACTOR_URL:', process.env.EXTRACTOR_URL || 'not set (worker will fail)')
console.log('   - LLM_PROVIDER:', process.env.LLM_PROVIDER || 'perplexity (default)')
console.log('   - LLM_API_KEY:', (process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY) ? 'set ✓' : 'not set (will use mock)')

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message)
      console.error('💡 Check your MONGO_URI in .env file and ensure MongoDB is accessible')
    })


const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// Health route
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API is alive 🚀' })
})

// Authentication Routes
app.use('/api/auth', authRoutes) // User signup, login, and profile - POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me

// API Routes
app.use('/api/upload', uploadRouter) // PPT upload (GitHub structure) - POST /api/upload
app.use('/api/images', imageRoutes) // Image upload and serving - POST /api/images/upload, GET /api/images/:filename
app.use('/api', jobsRouter) // Jobs and summaries
app.use('/api/ai', aiRouter) // AI summary by team name - GET /api/ai/summary/:teamName, POST /api/ai/summary/refresh

// Log all registered routes for debugging
console.log('📡 Registered API Routes:')
console.log('   - POST /api/auth/signup (User signup)')
console.log('   - POST /api/auth/login (User login)')
console.log('   - GET /api/auth/me (Get current user profile)')
console.log('   - POST /api/upload (PPT upload)')
console.log('   - POST /api/images/upload (Image upload)')
console.log('   - GET /api/images/:filename (Serve image)')
console.log('   - GET /api/images/id/:fileId (Serve image by ID)')
console.log('   - GET /api/ai/summary/:teamName')
console.log('   - POST /api/ai/summary/refresh')
console.log('   - GET /api/jobs/:id')
console.log('   - GET /api/summaries/:deckId')
app.use('/api/ideas', ideaRoutes) // Ideas CRUD + reactions
app.use('/api/events', eventRoutes) // Events CRUD
app.use('/api/teams', teamRoutes) // Teams CRUD
app.use('/api/scores', scoreRoutes) // Scores and leaderboard
app.use('/api/rounds', roundRoutes) // Rounds management
app.use('/api/announcements', announcementRoutes) // Announcements
app.use('/api/ppts', pptRoutes) // Legacy PPT routes (if needed)
app.use('/api/judges', judgeRoutes) // Judge routes (team submissions, scoring)
// Also add /api/judge/score for frontend compatibility (frontend expects /api/judge/score)
app.post('/api/judge/score', async (req, res) => {
  const Team = (await import('./models/Team.js')).default
  const Score = (await import('./models/Score.js')).default
  
  try {
    const { teamName, judgeName, score, comment } = req.body
    
    if (!teamName || !judgeName) {
      return res.status(400).json({ error: 'teamName and judgeName are required' })
    }
    
    const team = await Team.findOne({ name: { $regex: new RegExp(`^${teamName}$`, 'i') } })
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }
    
    let existingScore = await Score.findOne({ teamId: team._id, judgeId: judgeName })
    
    if (existingScore) {
      if (typeof score === 'number') {
        existingScore.scores.innovation = Math.min(10, score / 4)
        existingScore.scores.technical = Math.min(10, score / 4)
        existingScore.scores.presentation = Math.min(5, score / 4)
        existingScore.scores.problemSolving = Math.min(5, score / 4)
      } else if (typeof score === 'object') {
        existingScore.scores = { ...existingScore.scores, ...score }
      }
      await existingScore.save()
      res.json(existingScore)
    } else {
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
app.use('/api/qr', qrRoutes) // QR code generation
app.use('/api/submissions', submissionRoutes) // Submission uploads
app.use('/api/sticky-notes', stickyNoteRoutes) // Sticky notes CRUD

// Top ideas route (frontend expects /api/top)
app.get('/api/top', async (req, res) => {
  try {
    const Idea = (await import('./models/Idea.js')).default
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

// React to idea route (frontend expects /api/react/:ideaId)
app.post('/api/react/:ideaId', async (req, res) => {
  try {
    const Idea = (await import('./models/Idea.js')).default
    const { emoji } = req.body
    const validEmojis = ['fire', 'heart', 'star']
    
    if (!validEmojis.includes(emoji)) {
      return res.status(400).json({ error: 'Invalid emoji. Use: fire, heart, or star' })
    }
    
    const idea = await Idea.findById(req.params.ideaId)
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' })
    }
    
    if (emoji === 'fire') idea.fires = (idea.fires || 0) + 1
    if (emoji === 'heart') idea.hearts = (idea.hearts || 0) + 1
    if (emoji === 'star') idea.stars = (idea.stars || 0) + 1
    
    await idea.save()
    await idea.populate('teamId')
    
    res.json(idea)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Create HTTP server
const server = createServer(app)

// Initialize Socket.io
const io = initializeSocket(server)

// Make io available globally if needed
app.set('io', io)

server.listen(process.env.PORT || 8080, () => {
  console.log(`✅ API running on http://localhost:${process.env.PORT || 8080}`)
  console.log(`✅ Socket.io initialized for real-time collaboration`)
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${process.env.PORT || 8080} is already in use. Please stop the other process or use a different port.`)
    process.exit(1)
  } else {
    console.error('❌ Server error:', err)
    process.exit(1)
  }
})
