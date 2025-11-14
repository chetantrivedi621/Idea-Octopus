import express from 'express'
import Team from '../models/Team.js'

const router = express.Router()

// Generate QR code for a team
router.get('/:teamName', async (req, res) => {
  try {
    const teamName = decodeURIComponent(req.params.teamName)
    
    // Find team by name
    const team = await Team.findOne({ name: { $regex: new RegExp(`^${teamName}$`, 'i') } })
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }
    
    // Generate QR code data (URL to team's submission page)
    const qrData = `${process.env.CLIENT_URL || 'http://localhost:5173'}/team/${team._id}`
    
    // Return QR code data as JSON (frontend can generate QR code client-side)
    // Or use a QR code service URL
    res.json({
      teamId: team._id,
      teamName: team.name,
      qrData: qrData,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

