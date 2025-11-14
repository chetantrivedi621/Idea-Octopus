import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from '../hooks/useSocket'
import { getStickyNotes, createStickyNote as createStickyNoteAPI, bulkUpdateStickyNotes } from '../api/api.js'
import './Whiteboard.css'

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
// Soft pastel colors for sticky notes
const STICKY_COLORS = ['#FFE66D', '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#FEC8C1']

export default function Whiteboard({ teamId, onStickyNotesChange }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState('pen') // 'pen', 'text', 'sticky'
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const [stickyNotes, setStickyNotes] = useState([])
  const [textElements, setTextElements] = useState([])
  const [selectedSticky, setSelectedSticky] = useState(null)
  const [selectedText, setSelectedText] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [stickyColor, setStickyColor] = useState(STICKY_COLORS[0])
  const [newStickyText, setNewStickyText] = useState('')
  const [editingSticky, setEditingSticky] = useState(null)
  const [editingText, setEditingText] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })
  const textInputRef = useRef(null)
  const stickyInputRef = useRef(null)

  const { socket, isConnected } = useSocket(teamId)
  const autosaveTimerRef = useRef(null)

  // Load sticky notes from database on mount
  useEffect(() => {
    if (!teamId) return

    const loadStickyNotes = async () => {
      try {
        const notes = await getStickyNotes(teamId)
        // Transform database format to component format
        const transformedNotes = notes.map(note => ({
          id: note.noteId,
          x: note.x,
          y: note.y,
          text: note.text || '',
          color: note.color || STICKY_COLORS[0],
          width: note.width || 200,
          height: note.height || 150
        }))
        setStickyNotes(transformedNotes)
        if (onStickyNotesChange) {
          onStickyNotesChange(transformedNotes)
        }
      } catch (error) {
        console.error('Error loading sticky notes:', error)
      }
    }

    loadStickyNotes()
  }, [teamId, onStickyNotesChange])

  // Autosave sticky notes
  useEffect(() => {
    if (!teamId || stickyNotes.length === 0) return

    // Clear existing timer
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }

    // Set new timer for autosave (debounce 2 seconds)
    autosaveTimerRef.current = setTimeout(async () => {
      try {
        const notesToSave = stickyNotes.map(note => ({
          noteId: note.id,
          text: note.text || '',
          x: note.x,
          y: note.y,
          color: note.color,
          width: note.width,
          height: note.height
        }))
        await bulkUpdateStickyNotes({ teamId, notes: notesToSave })
      } catch (error) {
        console.error('Error autosaving sticky notes:', error)
      }
    }, 2000)

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [stickyNotes, teamId])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set default styles
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [color, lineWidth])

  // Socket listeners for real-time collaboration
  useEffect(() => {
    if (!socket) return

    const handleDrawing = (data) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      
      ctx.strokeStyle = data.color
      ctx.lineWidth = data.lineWidth
      ctx.beginPath()
      ctx.moveTo(data.x0, data.y0)
      ctx.lineTo(data.x1, data.y1)
      ctx.stroke()
    }

    const handleStickyCreated = (data) => {
      // Check if note already exists (avoid duplicates)
      setStickyNotes(prev => {
        const exists = prev.find(note => note.id === data.sticky.id)
        if (exists) return prev
        
        const updatedNotes = [...prev, data.sticky]
        if (onStickyNotesChange) {
          onStickyNotesChange(updatedNotes)
        }
        return updatedNotes
      })
    }

    const handleStickyUpdated = (data) => {
      setStickyNotes(prev => {
        const updatedNotes = prev.map(sticky => 
          sticky.id === data.sticky.id ? { ...sticky, ...data.sticky } : sticky
        )
        if (onStickyNotesChange) {
          onStickyNotesChange(updatedNotes)
        }
        return updatedNotes
      })
    }

    const handleStickyDeleted = (data) => {
      setStickyNotes(prev => {
        const updatedNotes = prev.filter(sticky => sticky.id !== data.stickyId)
        if (onStickyNotesChange) {
          onStickyNotesChange(updatedNotes)
        }
        return updatedNotes
      })
    }

    const handleTextCreated = (data) => {
      setTextElements(prev => [...prev, data.text])
    }

    const handleTextUpdated = (data) => {
      setTextElements(prev => 
        prev.map(text => 
          text.id === data.text.id ? data.text : text
        )
      )
    }

    const handleTextDeleted = (data) => {
      setTextElements(prev => prev.filter(text => text.id !== data.textId))
    }

    const handleWhiteboardClear = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    socket.on('whiteboard:drawing', handleDrawing)
    socket.on('whiteboard:sticky-created', handleStickyCreated)
    socket.on('whiteboard:sticky-updated', handleStickyUpdated)
    socket.on('whiteboard:sticky-deleted', handleStickyDeleted)
    socket.on('whiteboard:text-created', handleTextCreated)
    socket.on('whiteboard:text-updated', handleTextUpdated)
    socket.on('whiteboard:text-deleted', handleTextDeleted)
    socket.on('whiteboard:clear', handleWhiteboardClear)

    return () => {
      socket.off('whiteboard:drawing', handleDrawing)
      socket.off('whiteboard:sticky-created', handleStickyCreated)
      socket.off('whiteboard:sticky-updated', handleStickyUpdated)
      socket.off('whiteboard:sticky-deleted', handleStickyDeleted)
      socket.off('whiteboard:text-created', handleTextCreated)
      socket.off('whiteboard:text-updated', handleTextUpdated)
      socket.off('whiteboard:text-deleted', handleTextDeleted)
      socket.off('whiteboard:clear', handleWhiteboardClear)
    }
  }, [socket, onStickyNotesChange])

  // Drawing functions
  const startDrawing = useCallback((e) => {
    if (tool !== 'pen') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
  }, [tool])

  const draw = useCallback((e) => {
    if (!isDrawing || tool !== 'pen') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()

    // Emit drawing data for real-time sync
    if (socket && isConnected) {
      const prevX = ctx.currentX || x
      const prevY = ctx.currentY || y
      
      socket.emit('whiteboard:drawing', {
        x0: prevX,
        y0: prevY,
        x1: x,
        y1: y,
        color,
        lineWidth
      })
      
      ctx.currentX = x
      ctx.currentY = y
    }
  }, [isDrawing, tool, color, lineWidth, socket, isConnected])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.currentX = undefined
    ctx.currentY = undefined
  }, [])

  // Sticky note functions
  const createStickyNote = async (e) => {
    if (tool !== 'sticky') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSticky = {
      id: noteId,
      x,
      y,
      text: '',
      color: stickyColor,
      width: 200,
      height: 150
    }
    
    const updatedNotes = [...stickyNotes, newSticky]
    setStickyNotes(updatedNotes)
    setEditingSticky(newSticky.id)
    setNewStickyText('')
    
    // Notify parent component
    if (onStickyNotesChange) {
      onStickyNotesChange(updatedNotes)
    }
    
    // Save to database
    if (teamId) {
      try {
        await createStickyNoteAPI({
          teamId,
          noteId: newSticky.id,
          text: newSticky.text,
          x: newSticky.x,
          y: newSticky.y,
          color: newSticky.color,
          width: newSticky.width,
          height: newSticky.height
        })
      } catch (error) {
        console.error('Error saving sticky note:', error)
      }
    }
    
    // Broadcast via socket
    if (socket && isConnected) {
      socket.emit('whiteboard:sticky-create', { sticky: newSticky })
    }
  }

  // Create sticky note at center position (for + button)
  const createStickyNoteAtCenter = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const x = canvas.offsetWidth / 2 - 100
    const y = canvas.offsetHeight / 2 - 75
    
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSticky = {
      id: noteId,
      x,
      y,
      text: '',
      color: stickyColor,
      width: 200,
      height: 150
    }
    
    const updatedNotes = [...stickyNotes, newSticky]
    setStickyNotes(updatedNotes)
    setEditingSticky(newSticky.id)
    setNewStickyText('')
    
    // Notify parent component
    if (onStickyNotesChange) {
      onStickyNotesChange(updatedNotes)
    }
    
    // Save to database
    if (teamId) {
      try {
        await createStickyNoteAPI({
          teamId,
          noteId: newSticky.id,
          text: newSticky.text,
          x: newSticky.x,
          y: newSticky.y,
          color: newSticky.color,
          width: newSticky.width,
          height: newSticky.height
        })
      } catch (error) {
        console.error('Error saving sticky note:', error)
      }
    }
    
    // Broadcast via socket
    if (socket && isConnected) {
      socket.emit('whiteboard:sticky-create', { sticky: newSticky })
    }
  }

  const updateStickyNote = async (id, updates) => {
    let updatedSticky = null
    
    setStickyNotes(prev => {
      const updatedNotes = prev.map(sticky => {
        if (sticky.id === id) {
          updatedSticky = { ...sticky, ...updates }
          return updatedSticky
        }
        return sticky
      })
      
      // Notify parent component immediately
      if (onStickyNotesChange) {
        onStickyNotesChange(updatedNotes)
      }
      
      // Broadcast via socket
      if (socket && isConnected && updatedSticky) {
        socket.emit('whiteboard:sticky-update', { 
          sticky: { ...updatedSticky } 
        })
      }
      
      return updatedNotes
    })
    
    // Save to database (autosave will handle this, but we can also save immediately for critical updates)
    if (teamId && updates.text !== undefined && updatedSticky) {
      try {
        await createStickyNoteAPI({
          teamId,
          noteId: updatedSticky.id,
          text: updatedSticky.text,
          x: updatedSticky.x,
          y: updatedSticky.y,
          color: updatedSticky.color,
          width: updatedSticky.width,
          height: updatedSticky.height
        })
      } catch (error) {
        console.error('Error updating sticky note:', error)
      }
    }
  }

  const deleteStickyNote = async (id) => {
    const updatedNotes = stickyNotes.filter(sticky => sticky.id !== id)
    setStickyNotes(updatedNotes)
    
    // Notify parent component
    if (onStickyNotesChange) {
      onStickyNotesChange(updatedNotes)
    }
    
    // Delete from database
    if (teamId) {
      try {
        const { deleteStickyNote: deleteStickyNoteAPI } = await import('../api/api.js')
        await deleteStickyNoteAPI(id)
      } catch (error) {
        console.error('Error deleting sticky note:', error)
      }
    }
    
    // Broadcast via socket
    if (socket && isConnected) {
      socket.emit('whiteboard:sticky-delete', { stickyId: id })
    }
  }

  const handleStickyDragStart = (e, sticky) => {
    // Don't start dragging if clicking on the content area (for editing)
    if (e.target.classList.contains('sticky-content') || e.target.classList.contains('sticky-textarea') || e.target.classList.contains('sticky-delete-btn')) {
      return
    }
    
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setSelectedSticky(sticky.id)
    
    const canvasContainer = canvasRef.current?.parentElement
    if (!canvasContainer) return
    
    const rect = canvasContainer.getBoundingClientRect()
    const scrollLeft = canvasContainer.scrollLeft || 0
    const scrollTop = canvasContainer.scrollTop || 0
    
    setDragOffset({
      x: e.clientX - rect.left + scrollLeft - sticky.x,
      y: e.clientY - rect.top + scrollTop - sticky.y
    })
  }

  const handleStickyDrag = (e) => {
    if (!isDragging || !selectedSticky) return
    
    const canvasContainer = canvasRef.current?.parentElement
    if (!canvasContainer) return
    
    const rect = canvasContainer.getBoundingClientRect()
    const scrollLeft = canvasContainer.scrollLeft || 0
    const scrollTop = canvasContainer.scrollTop || 0
    
    const x = Math.max(0, e.clientX - rect.left + scrollLeft - dragOffset.x)
    const y = Math.max(0, e.clientY - rect.top + scrollTop - dragOffset.y)
    
    updateStickyNote(selectedSticky, { x, y })
  }

  const handleStickyDragEnd = () => {
    setIsDragging(false)
    setSelectedSticky(null)
  }

  // Text functions
  const createText = (e) => {
    if (tool !== 'text') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setTextPosition({ x, y })
    setTextInput('')
    setEditingText(true)
    setTimeout(() => textInputRef.current?.focus(), 0)
  }

  const saveText = () => {
    if (!textInput.trim()) {
      setEditingText(false)
      return
    }
    
    const newText = {
      id: Date.now().toString(),
      x: textPosition.x,
      y: textPosition.y,
      text: textInput,
      color,
      fontSize: 16
    }
    
    setTextElements(prev => [...prev, newText])
    setEditingText(false)
    setTextInput('')
    
    if (socket && isConnected) {
      socket.emit('whiteboard:text-create', { text: newText })
    }
  }

  const deleteText = (id) => {
    setTextElements(prev => prev.filter(text => text.id !== id))
    
    if (socket && isConnected) {
      socket.emit('whiteboard:text-delete', { textId: id })
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (socket && isConnected) {
      socket.emit('whiteboard:clear')
    }
  }

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-toolbar">
        <div className="toolbar-section">
          <button 
            className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
            title="Pen Tool"
          >
            ✏️
          </button>
          <button 
            className={`tool-btn ${tool === 'text' ? 'active' : ''}`}
            onClick={() => setTool('text')}
            title="Text Tool"
          >
            T
          </button>
          <button 
            className={`tool-btn ${tool === 'sticky' ? 'active' : ''}`}
            onClick={() => setTool('sticky')}
            title="Sticky Note"
          >
            📝
          </button>
        </div>

        {tool === 'pen' && (
          <div className="toolbar-section">
            <div className="color-picker-container">
              <button 
                className="color-btn"
                style={{ backgroundColor: color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              {showColorPicker && (
                <div className="color-picker">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      className="color-option"
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        setColor(c)
                        setShowColorPicker(false)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="line-width-slider"
            />
            <span className="line-width-label">{lineWidth}px</span>
          </div>
        )}

        {tool === 'sticky' && (
          <div className="toolbar-section">
            <button
              className="tool-btn add-sticky-btn"
              onClick={createStickyNoteAtCenter}
              title="Add New Sticky Note"
            >
              ➕
            </button>
            <div className="sticky-color-picker">
              {STICKY_COLORS.map(c => (
                <button
                  key={c}
                  className={`sticky-color-btn ${stickyColor === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setStickyColor(c)}
                  title={`Select ${c} color`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="toolbar-section">
          <button className="tool-btn clear-btn" onClick={clearCanvas} title="Clear Canvas">
            🗑️
          </button>
        </div>

        <div className="toolbar-section connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="whiteboard-canvas-container">
        <canvas
          ref={canvasRef}
          className="whiteboard-canvas"
          onMouseDown={(e) => {
            if (tool === 'pen') {
              startDrawing(e)
            } else if (tool === 'text') {
              createText(e)
            } else if (tool === 'sticky') {
              // Only create sticky if not clicking on existing sticky
              const clickedSticky = stickyNotes.find(sticky => {
                const rect = canvasRef.current.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top
                return x >= sticky.x && x <= sticky.x + sticky.width &&
                       y >= sticky.y && y <= sticky.y + sticky.height
              })
              if (!clickedSticky) {
                createStickyNote(e)
              }
            }
          }}
          onMouseMove={(e) => {
            if (tool === 'pen') {
              draw(e)
            } else if (tool === 'sticky' && isDragging) {
              handleStickyDrag(e)
            }
          }}
          onMouseUp={(e) => {
            if (tool === 'pen') {
              stopDrawing()
            } else if (tool === 'sticky' && isDragging) {
              handleStickyDragEnd()
            }
          }}
          onMouseLeave={(e) => {
            if (tool === 'pen') {
              stopDrawing()
            } else if (tool === 'sticky' && isDragging) {
              handleStickyDragEnd()
            }
          }}
        />
        
        {/* Global mouse move handler for dragging */}
        {isDragging && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              cursor: 'move'
            }}
            onMouseMove={handleStickyDrag}
            onMouseUp={handleStickyDragEnd}
            onMouseLeave={handleStickyDragEnd}
          />
        )}
        
        {/* Sticky Notes */}
        {stickyNotes.map(sticky => (
          <div
            key={sticky.id}
            className={`sticky-note ${isDragging && selectedSticky === sticky.id ? 'dragging' : ''}`}
            style={{
              left: `${sticky.x}px`,
              top: `${sticky.y}px`,
              backgroundColor: sticky.color,
              width: sticky.width,
              height: sticky.height
            }}
            onMouseDown={(e) => handleStickyDragStart(e, sticky)}
          >
            {editingSticky === sticky.id ? (
              <textarea
                ref={stickyInputRef}
                className="sticky-textarea"
                value={newStickyText}
                onChange={(e) => setNewStickyText(e.target.value)}
                onBlur={() => {
                  if (newStickyText.trim() || sticky.text) {
                    updateStickyNote(sticky.id, { text: newStickyText })
                  }
                  setEditingSticky(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditingSticky(null)
                    setNewStickyText('')
                  } else if (e.key === 'Enter' && e.ctrlKey) {
                    updateStickyNote(sticky.id, { text: newStickyText })
                    setEditingSticky(null)
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                autoFocus
                placeholder="Write your idea..."
              />
            ) : (
              <>
                <div 
                  className="sticky-content" 
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingSticky(sticky.id)
                    setNewStickyText(sticky.text || '')
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {sticky.text || 'Click to edit'}
                </div>
                <button 
                  className="sticky-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    deleteStickyNote(sticky.id)
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Delete note"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}

        {/* Text Elements */}
        {textElements.map(text => (
          <div
            key={text.id}
            className="text-element"
            style={{
              left: text.x,
              top: text.y,
              color: text.color,
              fontSize: text.fontSize
            }}
            onDoubleClick={() => deleteText(text.id)}
          >
            {text.text}
          </div>
        ))}

        {/* Text Input */}
        {editingText && (
          <input
            ref={textInputRef}
            type="text"
            className="text-input-overlay"
            style={{
              left: textPosition.x,
              top: textPosition.y,
              color: color
            }}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onBlur={saveText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveText()
              }
            }}
            autoFocus
            placeholder="Type text..."
          />
        )}
      </div>
    </div>
  )
}

