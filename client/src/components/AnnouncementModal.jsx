import { useState } from 'react'
import './AnnouncementModal.css'

function AnnouncementModal({ isOpen, onClose, onSave }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!message.trim()) {
      setError('Please enter an announcement message')
      return
    }

    if (message.trim().length < 5) {
      setError('Message must be at least 5 characters long')
      return
    }

    onSave(message.trim())
    setMessage('')
    setError('')
    onClose()
  }

  const handleClose = () => {
    setMessage('')
    setError('')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Announcement</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="announcement-form">
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Announcement Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setError('')
              }}
              className={`announcement-textarea ${error ? 'error' : ''}`}
              placeholder="Enter your announcement message here..."
              rows="5"
              autoFocus
            />
            {error && <p className="error-message">{error}</p>}
            <div className="character-count">
              {message.length} characters
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Post Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AnnouncementModal

