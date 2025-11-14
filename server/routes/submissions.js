import express from 'express'
import multer from 'multer'
import Team from '../models/Team.js'
import PPT from '../models/PPT.js'
import { Decks, Jobs } from '../models.js'
import mongoose from 'mongoose'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
})

// Upload submission (PPT file with team name and title)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { teamName, title } = req.body
    
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' })
    }
    
    if (!teamName) {
      return res.status(400).json({ error: 'Team name is required' })
    }
    
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint'
    ]
    
    if (!validTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only PDF or PPTX files are allowed' })
    }
    
    // Find or create team
    let team = await Team.findOne({ name: { $regex: new RegExp(`^${teamName}$`, 'i') } })
    
    if (!team) {
      team = new Team({
        name: teamName,
        description: title || '',
        category: 'General'
      })
      await team.save()
    }
    
    // Upload to GridFS (new system)
    const bucket = new mongoose.mongo.GridFSBucket(
      mongoose.connection.db,
      { bucketName: 'decks' }
    )
    
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    })
    
    const fileId = await new Promise((resolve, reject) => {
      uploadStream.on('error', reject)
      uploadStream.on('finish', () => resolve(uploadStream.id))
      uploadStream.end(req.file.buffer)
    })
    
    // Create deck record
    const deck = await Decks.create({
      filename: req.file.originalname,
      mime: req.file.mimetype,
      size: req.file.size,
      storage: { kind: 'gridfs', fileId },
      teamName: teamName
    })
    
    // Create job for processing
    const job = await Jobs.create({
      deckId: deck._id,
      status: 'queued',
      progress: 0
    })
    
    // Also save to legacy PPT model (for backward compatibility)
    try {
      // PPT model requires filePath, but we're using GridFS now
      // Create a placeholder path or skip if not available
      const ppt = new PPT({
        teamId: team._id,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        filePath: `gridfs://${fileId}` // Store GridFS fileId as path reference
      })
      await ppt.save()
    } catch (err) {
      // Ignore if PPT model doesn't exist or save fails
      console.warn('Could not save to legacy PPT model:', err.message)
    }
    
    res.status(201).json({
      success: true,
      teamId: team._id,
      teamName: team.name,
      deckId: deck._id,
      jobId: job._id,
      message: 'Submission uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading submission:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

