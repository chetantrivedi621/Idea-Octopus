import { Router as JobsRouter } from 'express'
import mongoose from 'mongoose'
import { Jobs, Summaries } from '../models.js'

const jobsRouter = JobsRouter()

function cleanId(raw) {
  return String(raw || '').trim()
}
function isObjectIdLike(id) {
  return /^[a-fA-F0-9]{24}$/.test(id)
}

jobsRouter.get('/jobs/:id', async (req, res) => {
  try {
    const id = cleanId(req.params.id)
    if (!isObjectIdLike(id)) return res.status(400).json({ error: 'Invalid job id' })
    const job = await Jobs.findById(id)
    if (!job) return res.status(404).json({ error: 'Not found' })
    return res.json(job)
  } catch (err) {
    console.error('Jobs status error:', err)
    return res.status(500).json({ error: 'Failed to fetch job' })
  }
})

jobsRouter.get('/summaries/:deckId', async (req, res) => {
  try {
    const id = cleanId(req.params.deckId)
    if (!isObjectIdLike(id)) return res.status(400).json({ error: 'Invalid deck id' })
    // Let Mongoose cast the string to ObjectId
    const summary = await Summaries.findOne({ deckId: id })
    if (!summary) return res.status(404).json({ error: 'Not ready' })
    return res.json(summary)
  } catch (err) {
    console.error('Summary fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch summary' })
  }
})
// DEV helper: list last 5 jobs
jobsRouter.get('/jobs', async (req, res) => {
    const items = await Jobs.find().sort({ createdAt: -1 }).limit(5)
    res.json(items)
  })
  

export { jobsRouter }
