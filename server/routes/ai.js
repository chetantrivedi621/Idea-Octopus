import express from 'express'
import mongoose from 'mongoose'
import { Decks, Jobs, Summaries } from '../models.js'

const router = express.Router()

// Helper to normalize team name for matching (remove spaces, special chars, lowercase)
function normalizeTeamName(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .trim()
}

// Helper to find deck by team name (filename or metadata)
async function findDeckByTeamName(teamName) {
  if (!teamName) return null
  
  const normalizedTeamName = normalizeTeamName(teamName)
  
  // First try to find by teamName field (exact match, case-insensitive)
  let deck = await Decks.findOne({
    $or: [
      { teamName: { $regex: new RegExp(`^${teamName}$`, 'i') } },
      { teamName: { $regex: new RegExp(`^${normalizedTeamName}$`, 'i') } }
    ]
  }).sort({ createdAt: -1 })
  
  // If not found, try filename matching with normalized name
  if (!deck) {
    // Try multiple patterns: exact match, normalized match, partial match
    const searchPatterns = [
      teamName, // Original name
      normalizedTeamName, // Normalized (no spaces)
      teamName.replace(/\s+/g, ''), // Remove spaces
      teamName.replace(/\s+/g, '-'), // Replace spaces with dash
      teamName.replace(/\s+/g, '_'), // Replace spaces with underscore
    ]
    
    // Remove duplicates and empty strings
    const uniquePatterns = [...new Set(searchPatterns.filter(p => p))]
    
    for (const pattern of uniquePatterns) {
      deck = await Decks.findOne({
        $or: [
          { filename: { $regex: pattern, $options: 'i' } },
          { filename: { $regex: normalizeTeamName(pattern), $options: 'i' } }
        ]
      }).sort({ createdAt: -1 })
      
      if (deck) break
    }
  }
  
  // Last resort: try to find any deck with similar name (fuzzy match)
  if (!deck && normalizedTeamName.length > 3) {
    // Try to find decks where filename contains parts of the team name
    const nameParts = normalizedTeamName.match(/.{3,}/g) || []
    for (const part of nameParts) {
      deck = await Decks.findOne({
        filename: { $regex: part, $options: 'i' }
      }).sort({ createdAt: -1 })
      
      if (deck) break
    }
  }
  
  return deck
}

// Transform GitHub summary format to client-expected format
function transformSummary(summary) {
  if (!summary) return null
  
  // Extract key information from the summary
  const tldr = summary.tldr || []
  const brief = summary.nonTechnicalBrief || ''
  const highlights = summary.highlights || {}
  
  // Build summary text from TLDR and brief
  const summaryText = tldr.length > 0 
    ? tldr.join('. ') + '. ' + brief
    : brief || 'No summary available'
  
  // Build future scope from highlights
  const futureScope = highlights.differentiation 
    ? highlights.differentiation.join('. ')
    : 'Future scope analysis pending'
  
  // Build feasibility from rubric scores
  const feasibilityScore = summary.rubricScores?.solutionFeasibility || 
                          summary.rubricScores?.problemClarity || 0
  
  const feasibilityText = highlights.risks && highlights.risks.length > 0
    ? `Feasibility: ${feasibilityScore}/10. Risks: ${highlights.risks.join(', ')}`
    : `Feasibility score: ${feasibilityScore}/10`
  
  return {
    summary: summaryText,
    futureScope: futureScope,
    feasibility: feasibilityText,
    feasibilityScore: Math.round(feasibilityScore * 10), // Convert to 0-100 scale
    // Include full summary for advanced use
    fullSummary: summary
  }
}

// GET /api/ai/summary/:teamName
router.get('/summary/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params
    
    if (!teamName) {
      return res.status(400).json({ error: 'Team name is required' })
    }
    
    // Find deck associated with team name
    const deck = await findDeckByTeamName(teamName)
    
    if (!deck) {
      // Try to find all decks to help debug
      const allDecks = await Decks.find().select('filename teamName createdAt').sort({ createdAt: -1 }).limit(10)
      
      // Return a more user-friendly response without debug info in production
      return res.status(404).json({ 
        error: 'No deck found for this team',
        message: `Could not find a presentation for team: "${teamName}"`,
        summary: 'No presentation uploaded yet. Please upload a PPT/PDF file to generate AI summary.',
        futureScope: 'Upload a presentation to generate AI summary',
        feasibility: 'N/A',
        feasibilityScore: null
      })
    }
    
    // Find summary for this deck (sort by newest first)
    const summary = await Summaries.findOne({ deckId: deck._id }).sort({ createdAt: -1 })
    
    if (!summary) {
      // Check if there's a job in progress
      const job = await Jobs.findOne({ deckId: deck._id }).sort({ createdAt: -1 })
      
      if (job && job.status === 'processing') {
        return res.status(202).json({
          message: 'AI summary is being generated',
          status: 'processing',
          summary: 'Analysis in progress...',
          futureScope: 'Pending',
          feasibility: 'Pending'
        })
      }
      
      if (job && job.status === 'queued') {
        return res.status(202).json({
          message: 'AI summary is queued for processing',
          status: 'queued',
          summary: 'Waiting for analysis...',
          futureScope: 'Pending',
          feasibility: 'Pending'
        })
      }
      
      if (job && job.status === 'error') {
        return res.status(500).json({
          error: 'AI analysis failed',
          message: job.error || 'Unknown error occurred during processing',
          summary: 'Analysis failed. Please try refreshing.',
          futureScope: 'N/A',
          feasibility: 'N/A'
        })
      }
      
      // No summary and no job - return default
      return res.json({
        summary: 'AI analysis pending. Upload a presentation and wait for processing.',
        futureScope: 'Future scope will be analyzed after presentation processing',
        feasibility: 'Feasibility analysis will be available after processing',
        feasibilityScore: null
      })
    }
    
    // Transform and return summary
    const transformed = transformSummary(summary)
    console.log('Returning transformed summary for team:', teamName, 'Deck:', deck._id)
    res.json(transformed)
    
  } catch (error) {
    console.error('Error fetching AI summary:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch AI summary' })
  }
})

// POST /api/ai/summary/refresh - Re-trigger summary generation
router.post('/summary/refresh', async (req, res) => {
  try {
    const { teamName } = req.body
    
    if (!teamName) {
      return res.status(400).json({ error: 'Team name is required' })
    }
    
    // Find deck associated with team name
    const deck = await findDeckByTeamName(teamName)
    
    if (!deck) {
      return res.status(404).json({ error: 'No deck found for this team' })
    }
    
    // Delete existing summary if any
    await Summaries.deleteOne({ deckId: deck._id })
    
    // Create a new job to re-process
    const newJob = await Jobs.create({
      deckId: deck._id,
      status: 'queued',
      progress: 0
    })
    
    res.json({
      message: 'AI summary refresh queued',
      jobId: newJob._id,
      deckId: deck._id,
      status: 'queued'
    })
    
  } catch (error) {
    console.error('Error refreshing AI summary:', error)
    res.status(500).json({ error: error.message || 'Failed to refresh AI summary' })
  }
})

export default router
