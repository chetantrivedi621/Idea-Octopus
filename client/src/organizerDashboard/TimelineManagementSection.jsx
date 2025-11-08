import { useState } from 'react'
import './TimelineManagementSection.css'

function TimelineManagementSection({ rounds, currentRound, onUpdateRound, onSetCurrentRound }) {
  const [editingRound, setEditingRound] = useState(null)

  const handleStartRound = (roundId) => {
    const now = Date.now()
    // End the previous active round first
    if (currentRound && currentRound.id !== roundId) {
      onUpdateRound(currentRound.id, { 
        status: 'completed', 
        endTime: now 
      })
    }
    // Start the new round with current time
    onUpdateRound(roundId, { startTime: now })
    onSetCurrentRound(roundId)
  }

  const handleEditRound = (round) => {
    const now = new Date()
    const defaultTime = now.toISOString().slice(0, 16)
    
    setEditingRound({
      ...round,
      startTimeInput: round.startTime 
        ? new Date(round.startTime).toISOString().slice(0, 16) 
        : defaultTime,
      endTimeInput: round.endTime 
        ? new Date(round.endTime).toISOString().slice(0, 16) 
        : ''
    })
  }

  const handleCancelEdit = () => {
    setEditingRound(null)
  }

  const handleSaveRound = () => {
    if (editingRound) {
      const updates = {
        name: editingRound.name
      }
      
      if (editingRound.startTimeInput) {
        updates.startTime = new Date(editingRound.startTimeInput).getTime()
      } else {
        updates.startTime = null
      }
      
      if (editingRound.endTimeInput) {
        updates.endTime = new Date(editingRound.endTimeInput).getTime()
      } else {
        updates.endTime = null
      }
      
      onUpdateRound(editingRound.id, updates)
      setEditingRound(null)
    }
  }

  const handleInputChange = (field, value) => {
    setEditingRound(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#4caf50'
      case 'completed':
        return '#2196f3'
      case 'upcoming':
        return '#ff9800'
      default:
        return '#757575'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return '▶️'
      case 'completed':
        return '✅'
      case 'upcoming':
        return '⏳'
      default:
        return '⏸️'
    }
  }

  return (
    <section className="timeline-management-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">📅</span>
          Timeline Management
        </h2>
      </div>

      <div className="timeline-list">
        {rounds.map((round) => (
          <div key={round.id} className={`timeline-item ${round.status}`}>
            {editingRound && editingRound.id === round.id ? (
              <div className="timeline-edit-form">
                <div className="edit-form-group">
                  <label>Round Name</label>
                  <input
                    type="text"
                    value={editingRound.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="edit-input"
                  />
                </div>
                <div className="edit-form-group">
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    value={editingRound.startTimeInput}
                    onChange={(e) => handleInputChange('startTimeInput', e.target.value)}
                    className="edit-input"
                  />
                  <button
                    type="button"
                    className="set-now-button"
                    onClick={() => {
                      const now = new Date().toISOString().slice(0, 16)
                      handleInputChange('startTimeInput', now)
                    }}
                  >
                    Set to Now
                  </button>
                </div>
                <div className="edit-form-group">
                  <label>End Time</label>
                  <input
                    type="datetime-local"
                    value={editingRound.endTimeInput}
                    onChange={(e) => handleInputChange('endTimeInput', e.target.value)}
                    className="edit-input"
                  />
                  <button
                    type="button"
                    className="set-now-button"
                    onClick={() => {
                      const now = new Date().toISOString().slice(0, 16)
                      handleInputChange('endTimeInput', now)
                    }}
                  >
                    Set to Now
                  </button>
                </div>
                <div className="edit-form-actions">
                  <button className="save-button" onClick={handleSaveRound}>
                    Save
                  </button>
                  <button className="cancel-button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="timeline-item-header">
                  <div className="timeline-item-left">
                    <span className="timeline-icon">{getStatusIcon(round.status)}</span>
                    <div className="timeline-item-info">
                      <span className="timeline-item-name">{round.name}</span>
                      <div className="timeline-item-times">
                        {round.startTime && (
                          <span className="timeline-item-time">
                            <strong>Start:</strong> {new Date(round.startTime).toLocaleString()}
                          </span>
                        )}
                        {round.endTime && (
                          <span className="timeline-item-time">
                            <strong>End:</strong> {new Date(round.endTime).toLocaleString()}
                          </span>
                        )}
                        {!round.startTime && !round.endTime && (
                          <span className="timeline-item-time no-time">No times set</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="timeline-item-actions">
                    <button
                      className="edit-round-button"
                      onClick={() => handleEditRound(round)}
                    >
                      Edit
                    </button>
                    {round.status === 'upcoming' && (
                      <button
                        className="start-round-button"
                        onClick={() => handleStartRound(round.id)}
                      >
                        Start Round
                      </button>
                    )}
                    {round.status === 'active' && (
                      <span className="active-badge">Active</span>
                    )}
                    {round.status === 'completed' && (
                      <span className="completed-badge">Completed</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default TimelineManagementSection

