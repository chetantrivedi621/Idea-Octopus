import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import { Decks, Jobs } from '../models.js'

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(), // 🧠 keep file in memory
  limits: { fileSize: 25 * 1024 * 1024 }
})

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file missing' })

    console.log('📤 Upload request received:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      teamName: req.body.teamName || 'not provided'
    })

    // ✅ allow only pptx or pdf
    const ok = new Set([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]).has(req.file.mimetype)
    if (!ok) return res.status(400).json({ error: 'Only PDF or PPTX allowed' })

    // ✅ Upload to GridFS
    const bucket = new mongoose.mongo.GridFSBucket(
      mongoose.connection.db,
      { bucketName: 'decks' }
    )

    console.log('📦 Uploading to GridFS...')
    
    // ✅ open upload stream
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    })

    // ✅ resolve on finish using uploadStream.id
    const fileId = await new Promise((resolve, reject) => {
      uploadStream.on('error', (err) => {
        console.error('❌ GridFS upload error:', err)
        reject(err)
      })
      uploadStream.on('finish', () => {
        console.log('✅ File uploaded to GridFS, fileId:', uploadStream.id)
        resolve(uploadStream.id)
      })
      uploadStream.end(req.file.buffer)
    })

    // ✅ create deck & job records
    // Accept optional teamName from form data
    const teamName = req.body.teamName || null
    
    console.log('📝 Creating Deck record...')
    const deck = await Decks.create({
      filename: req.file.originalname,
      mime: req.file.mimetype,
      size: req.file.size,
      storage: { kind: 'gridfs', fileId },
      // Store teamName in metadata if provided
      ...(teamName && { teamName })
    })
    console.log('✅ Deck created:', { deckId: deck._id, teamName: deck.teamName })

    console.log('🔄 Creating Job for worker...')
    const job = await Jobs.create({
      deckId: deck._id,
      status: 'queued',
      progress: 0
    })
    console.log('✅ Job created:', { jobId: job._id, status: job.status })

    console.log('🎉 Upload complete! Deck and Job created successfully.')
    
    res.json({ 
      success: true,
      jobId: job._id, 
      deckId: deck._id,
      teamName: teamName,
      message: 'File uploaded to GridFS and job queued for processing'
    })
  } catch (err) {
    console.error('❌ Upload error:', err)
    res.status(500).json({ error: 'Upload failed', detail: String(err) })
  }
})

export default router
