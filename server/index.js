import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import connectDB from './config/database.js'

// Import routes
import teamRoutes from './routes/teams.js'
import scoreRoutes from './routes/scores.js'
import ideaRoutes from './routes/ideas.js'
import announcementRoutes from './routes/announcements.js'
import roundRoutes from './routes/rounds.js'
import pptRoutes from './routes/ppts.js'
import eventRoutes from './routes/events.js'

dotenv.config()

// Connect to database
connectDB()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// Health route
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API is alive 🚀' })
})

// API Routes
app.use('/api/teams', teamRoutes)
app.use('/api/scores', scoreRoutes)
app.use('/api/ideas', ideaRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/rounds', roundRoutes)
app.use('/api/ppts', pptRoutes)
app.use('/api/events', eventRoutes)

// Serve uploaded files
app.use('/uploads', express.static('uploads'))

const PORT = process.env.PORT || 8080

app.listen(PORT, () =>
  console.log(`✅ API running on http://localhost:${PORT}`)
)
