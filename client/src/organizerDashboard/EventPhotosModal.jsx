import { useState, useEffect } from 'react'
import './EventPhotosModal.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function EventPhotosModal({ isOpen, onClose, event, onSave }) {
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (event) {
      setPhotos(event.memories || event.gallery || [])
    }
  }, [event])

  if (!isOpen) return null

  const handleFileSelect = async (files) => {
    setUploading(true)
    setError('')
    
    const newPhotos = [...photos]
    
    try {
      for (let file of files) {
        const formData = new FormData()
        formData.append('image', file)
        
        const response = await fetch(`${API_URL}/upload/image`, {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          newPhotos.push(data.filename || data.url)
        } else {
          throw new Error('Failed to upload photo')
        }
      }
      
      setPhotos(newPhotos)
    } catch (err) {
      setError('Failed to upload some photos. Please try again.')
      console.error('Error uploading photos:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch(`${API_URL}/events/${event._id || event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memories: photos
        })
      })

      if (response.ok) {
        const updatedEvent = await response.json()
        if (onSave) {
          onSave(updatedEvent)
        }
        onClose()
      } else {
        throw new Error('Failed to save photos')
      }
    } catch (err) {
      setError('Failed to save photos. Please try again.')
      console.error('Error saving photos:', err)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content photos-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Event Photos</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="photos-form">
          <div className="form-group">
            <label className="form-label">Upload Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  handleFileSelect(Array.from(e.target.files))
                }
              }}
              className="form-input"
              disabled={uploading}
            />
            <p className="form-hint">You can select multiple photos at once</p>
          </div>

          {photos.length > 0 && (
            <div className="photos-preview-section">
              <h3 className="photos-section-title">Uploaded Photos ({photos.length})</h3>
              <div className="photos-grid">
                {photos.map((photo, index) => (
                  <div key={index} className="photo-item">
                    <div className="photo-preview">
                      <img
                        src={photo.startsWith('http') ? photo : `${API_URL}/images/${photo}`}
                        alt={`Photo ${index + 1}`}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="remove-photo-button"
                      onClick={() => handleRemovePhoto(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save Photos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventPhotosModal

