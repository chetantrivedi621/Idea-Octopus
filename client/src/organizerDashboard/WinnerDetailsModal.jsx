import { useState, useEffect } from 'react'
import './WinnerDetailsModal.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function WinnerDetailsModal({ isOpen, onClose, event, onSave }) {
  const [winners, setWinners] = useState([
    { position: 1, teamName: '', email: '', linkedin: '', winnerPhoto: null },
    { position: 2, teamName: '', email: '', linkedin: '', winnerPhoto: null },
    { position: 3, teamName: '', email: '', linkedin: '', winnerPhoto: null }
  ])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (event && event.winners) {
      const existingWinners = [...winners]
      event.winners.forEach(winner => {
        if (winner.position >= 1 && winner.position <= 3) {
          existingWinners[winner.position - 1] = {
            position: winner.position,
            teamName: winner.teamName || '',
            email: winner.email || '',
            linkedin: winner.linkedin || '',
            winnerPhoto: winner.winnerPhoto || null
          }
        }
      })
      setWinners(existingWinners)
    }
  }, [event])

  if (!isOpen) return null

  const handleWinnerChange = (index, field, value) => {
    const updatedWinners = [...winners]
    updatedWinners[index] = {
      ...updatedWinners[index],
      [field]: value
    }
    setWinners(updatedWinners)
  }

  const handlePhotoChange = async (index, file) => {
    if (!file) return
    
    setUploading(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        const updatedWinners = [...winners]
        updatedWinners[index] = {
          ...updatedWinners[index],
          winnerPhoto: data.filename || data.url
        }
        setWinners(updatedWinners)
      } else {
        throw new Error('Failed to upload photo')
      }
    } catch (err) {
      setError('Failed to upload photo. Please try again.')
      console.error('Error uploading photo:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Filter out empty winners
    const validWinners = winners.filter(w => w.teamName.trim() !== '')
    
    if (validWinners.length === 0) {
      setError('Please add at least one winner')
      return
    }

    try {
      const response = await fetch(`${API_URL}/events/${event._id || event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          winners: validWinners.map(w => ({
            position: w.position,
            teamName: w.teamName.trim(),
            email: w.email.trim(),
            linkedin: w.linkedin.trim(),
            winnerPhoto: w.winnerPhoto
          }))
        })
      })

      if (response.ok) {
        const updatedEvent = await response.json()
        if (onSave) {
          onSave(updatedEvent)
        }
        onClose()
      } else {
        throw new Error('Failed to save winners')
      }
    } catch (err) {
      setError('Failed to save winners. Please try again.')
      console.error('Error saving winners:', err)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content winner-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Winner Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="winner-form">
          {winners.map((winner, index) => (
            <div key={index} className="winner-form-section">
              <h3 className="winner-position-title">
                {index === 0 ? '🥇 1st Place' : index === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}
              </h3>
              
              <div className="form-group">
                <label className="form-label">Team Name *</label>
                <input
                  type="text"
                  value={winner.teamName}
                  onChange={(e) => handleWinnerChange(index, 'teamName', e.target.value)}
                  className="form-input"
                  placeholder="Enter team name"
                  required={index === 0}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={winner.email}
                    onChange={(e) => handleWinnerChange(index, 'email', e.target.value)}
                    className="form-input"
                    placeholder="team@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn</label>
                  <input
                    type="url"
                    value={winner.linkedin}
                    onChange={(e) => handleWinnerChange(index, 'linkedin', e.target.value)}
                    className="form-input"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Winner Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handlePhotoChange(index, e.target.files[0])
                    }
                  }}
                  className="form-input"
                  disabled={uploading}
                />
                {winner.winnerPhoto && (
                  <div className="photo-preview">
                    <span>Photo uploaded: {winner.winnerPhoto}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save Winners'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WinnerDetailsModal

