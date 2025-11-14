import express from 'express'
import StickyNote from '../models/StickyNote.js'

const router = express.Router()

// Get all sticky notes for a team
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params
    const notes = await StickyNote.find({ teamId }).sort({ createdAt: 1 })
    res.json(notes)
  } catch (error) {
    console.error('Error fetching sticky notes:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create a new sticky note
router.post('/', async (req, res) => {
  try {
    const { teamId, noteId, text, x, y, color, width, height } = req.body
    
    if (!teamId || !noteId) {
      return res.status(400).json({ error: 'teamId and noteId are required' })
    }

    // Check if note already exists
    let note = await StickyNote.findOne({ noteId })
    
    if (note) {
      // Update existing note
      note.text = text || note.text
      note.x = x !== undefined ? x : note.x
      note.y = y !== undefined ? y : note.y
      note.color = color || note.color
      note.width = width || note.width
      note.height = height || note.height
      await note.save()
      res.json(note)
    } else {
      // Create new note
      note = new StickyNote({
        teamId,
        noteId,
        text: text || '',
        x: x || 100,
        y: y || 100,
        color: color || '#FFE66D',
        width: width || 200,
        height: height || 150
      })
      await note.save()
      res.status(201).json(note)
    }
  } catch (error) {
    console.error('Error creating/updating sticky note:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update a sticky note
router.patch('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params
    const { text, x, y, color, width, height } = req.body

    const note = await StickyNote.findOne({ noteId })
    if (!note) {
      return res.status(404).json({ error: 'Sticky note not found' })
    }

    if (text !== undefined) note.text = text
    if (x !== undefined) note.x = x
    if (y !== undefined) note.y = y
    if (color !== undefined) note.color = color
    if (width !== undefined) note.width = width
    if (height !== undefined) note.height = height

    await note.save()
    res.json(note)
  } catch (error) {
    console.error('Error updating sticky note:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete a sticky note
router.delete('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params
    const note = await StickyNote.findOneAndDelete({ noteId })
    
    if (!note) {
      return res.status(404).json({ error: 'Sticky note not found' })
    }
    
    res.json({ message: 'Sticky note deleted successfully', noteId })
  } catch (error) {
    console.error('Error deleting sticky note:', error)
    res.status(500).json({ error: error.message })
  }
})

// Bulk update sticky notes (for autosave)
router.post('/bulk', async (req, res) => {
  try {
    const { teamId, notes } = req.body
    
    if (!teamId || !Array.isArray(notes)) {
      return res.status(400).json({ error: 'teamId and notes array are required' })
    }

    const operations = notes.map(note => ({
      updateOne: {
        filter: { noteId: note.noteId || note.id },
        update: {
          $set: {
            teamId,
            noteId: note.noteId || note.id,
            text: note.text || '',
            x: note.x || 100,
            y: note.y || 100,
            color: note.color || '#FFE66D',
            width: note.width || 200,
            height: note.height || 150,
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    }))

    await StickyNote.bulkWrite(operations)
    const savedNotes = await StickyNote.find({ teamId })
    res.json(savedNotes)
  } catch (error) {
    console.error('Error bulk updating sticky notes:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

