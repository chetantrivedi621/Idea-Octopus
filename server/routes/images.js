import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'

const router = express.Router()

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false)
    }
  }
})

// Upload image to GridFS
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    console.log('📤 Image upload request received:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      type: req.body.type || 'general' // banner, winner, gallery, etc.
    })

    // Create GridFS bucket for images
    const bucket = new mongoose.mongo.GridFSBucket(
      mongoose.connection.db,
      { bucketName: 'images' }
    )

    // Generate unique filename
    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    console.log('📦 Uploading image to GridFS...')
    
    // Open upload stream
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        type: req.body.type || 'general',
        uploadedAt: new Date()
      }
    })

    // Upload file
    const fileId = await new Promise((resolve, reject) => {
      uploadStream.on('error', (err) => {
        console.error('❌ GridFS upload error:', err)
        reject(err)
      })
      uploadStream.on('finish', () => {
        console.log('✅ Image uploaded to GridFS, fileId:', uploadStream.id)
        resolve(uploadStream.id)
      })
      uploadStream.end(req.file.buffer)
    })

    res.json({
      success: true,
      fileId: fileId.toString(),
      filename: filename,
      message: 'Image uploaded successfully to GridFS'
    })
  } catch (err) {
    console.error('❌ Image upload error:', err)
    res.status(500).json({ error: 'Upload failed', detail: String(err) })
  }
})

// Serve image from GridFS
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params

    // Create GridFS bucket
    const bucket = new mongoose.mongo.GridFSBucket(
      mongoose.connection.db,
      { bucketName: 'images' }
    )

    // Find file by filename
    const files = await bucket.find({ filename }).toArray()
    
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Image not found' })
    }

    const file = files[0]

    // Set appropriate headers
    res.set({
      'Content-Type': file.contentType || 'image/jpeg',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    })

    // Stream file to response
    const downloadStream = bucket.openDownloadStreamByName(filename)
    
    downloadStream.on('error', (err) => {
      console.error('❌ Error streaming image:', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming image' })
      }
    })

    downloadStream.pipe(res)
  } catch (err) {
    console.error('❌ Error serving image:', err)
    res.status(500).json({ error: 'Error serving image', detail: String(err) })
  }
})

// Get image by fileId (alternative endpoint)
router.get('/id/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' })
    }

    // Create GridFS bucket
    const bucket = new mongoose.mongo.GridFSBucket(
      mongoose.connection.db,
      { bucketName: 'images' }
    )

    // Find file by ID
    const fileIdObj = new mongoose.Types.ObjectId(fileId)
    const files = await bucket.find({ _id: fileIdObj }).toArray()
    
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Image not found' })
    }

    const file = files[0]

    // Set appropriate headers
    res.set({
      'Content-Type': file.contentType || 'image/jpeg',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000'
    })

    // Stream file to response
    const downloadStream = bucket.openDownloadStream(fileIdObj)
    
    downloadStream.on('error', (err) => {
      console.error('❌ Error streaming image:', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming image' })
      }
    })

    downloadStream.pipe(res)
  } catch (err) {
    console.error('❌ Error serving image:', err)
    res.status(500).json({ error: 'Error serving image', detail: String(err) })
  }
})

export default router

