import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Mongo error:', err.message))


const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// tiny health route
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API is alive 🚀' })
})

// sample ideas route (no DB yet)
const ideas = [
  { id: '1', title: 'Smart Dustbin', votes: 10 },
  { id: '2', title: 'Campus Buddy', votes: 6 }
]
app.get('/api/ideas', (req, res) => res.json(ideas))

app.listen(process.env.PORT || 8080, () =>
  console.log(`✅ API running on http://localhost:${process.env.PORT || 8080}`)
)
