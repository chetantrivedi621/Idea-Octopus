import express from 'express'
import PPT from '../models/PPT.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/ppts')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `team-${req.body.teamId}-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.ppt', '.pptx', '.pdf']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PPT, PPTX, and PDF files are allowed.'))
    }
  }
})

const router = express.Router()

// Get PPT for a team
router.get('/team/:teamId', async (req, res) => {
  try {
    const ppt = await PPT.findOne({ teamId: req.params.teamId })
      .populate('teamId')
      .sort({ uploadDate: -1 })
    
    if (!ppt) {
      return res.status(404).json({ error: 'PPT not found' })
    }
    
    res.json(ppt)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Upload PPT
router.post('/upload', upload.single('ppt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    
    // Delete old PPT if exists
    const oldPPT = await PPT.findOne({ teamId: req.body.teamId })
    if (oldPPT && fs.existsSync(oldPPT.filePath)) {
      fs.unlinkSync(oldPPT.filePath)
      await PPT.findByIdAndDelete(oldPPT._id)
    }
    
    const ppt = new PPT({
      teamId: req.body.teamId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      filePath: req.file.path
    })
    
    await ppt.save()
    await ppt.populate('teamId')
    
    res.status(201).json(ppt)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Download PPT
router.get('/:id/download', async (req, res) => {
  try {
    const ppt = await PPT.findById(req.params.id)
    if (!ppt) {
      return res.status(404).json({ error: 'PPT not found' })
    }
    
    if (!fs.existsSync(ppt.filePath)) {
      return res.status(404).json({ error: 'File not found on server' })
    }
    
    res.download(ppt.filePath, ppt.fileName)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

