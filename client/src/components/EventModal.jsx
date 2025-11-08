import { useState } from 'react'
import './EventModal.css'

function EventModal({ isOpen, onClose, onSave, event = null }) {
  const [name, setName] = useState(event?.name || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startDate, setStartDate] = useState(event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '')
  const [endDate, setEndDate] = useState(event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '')
  const [location, setLocation] = useState(event?.location || '')
  const [rounds, setRounds] = useState(event?.rounds || [
    { name: 'Registration', startTime: '', endTime: '', order: 1 },
    { name: 'Round 1: Ideation', startTime: '', endTime: '', order: 2 },
    { name: 'Round 2: Development', startTime: '', endTime: '', order: 3 },
    { name: 'Round 3: Presentation', startTime: '', endTime: '', order: 4 },
    { name: 'Results & Awards', startTime: '', endTime: '', order: 5 }
  ])
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleRoundChange = (index, field, value) => {
    const updatedRounds = [...rounds]
    updatedRounds[index] = { ...updatedRounds[index], [field]: value }
    setRounds(updatedRounds)
  }

  const addRound = () => {
    setRounds([...rounds, { name: '', startTime: '', endTime: '', order: rounds.length + 1 }])
  }

  const removeRound = (index) => {
    if (rounds.length > 1) {
      const updatedRounds = rounds.filter((_, i) => i !== index)
      updatedRounds.forEach((round, i) => {
        round.order = i + 1
      })
      setRounds(updatedRounds)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter event name')
      return
    }

    if (!startDate || !endDate) {
      setError('Please select start and end dates')
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date')
      return
    }

    const roundsWithDates = rounds.map(round => ({
      ...round,
      startTime: round.startTime ? new Date(round.startTime) : null,
      endTime: round.endTime ? new Date(round.endTime) : null
    }))

    await onSave({
      name: name.trim(),
      description: description.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location: location.trim(),
      rounds: roundsWithDates
    })

    // Reset form
    setName('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setLocation('')
    setRounds([
      { name: 'Registration', startTime: '', endTime: '', order: 1 },
      { name: 'Round 1: Ideation', startTime: '', endTime: '', order: 2 },
      { name: 'Round 2: Development', startTime: '', endTime: '', order: 3 },
      { name: 'Round 3: Presentation', startTime: '', endTime: '', order: 4 },
      { name: 'Results & Awards', startTime: '', endTime: '', order: 5 }
    ])
    onClose()
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setLocation('')
    setError('')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content event-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Event Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`form-input ${error && !name.trim() ? 'error' : ''}`}
              placeholder="e.g., HackCapsule 2024"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              placeholder="Enter event description..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">Start Date & Time *</label>
              <input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`form-input ${error && !startDate ? 'error' : ''}`}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate" className="form-label">End Date & Time *</label>
              <input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`form-input ${error && !endDate ? 'error' : ''}`}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
              placeholder="e.g., Virtual / In-Person"
            />
          </div>

          <div className="form-group">
            <div className="rounds-header">
              <label className="form-label">Timeline Rounds *</label>
              <button type="button" className="add-round-button" onClick={addRound}>
                + Add Round
              </button>
            </div>
            <div className="rounds-list">
              {rounds.map((round, index) => (
                <div key={index} className="round-item">
                  <div className="round-header">
                    <input
                      type="text"
                      value={round.name}
                      onChange={(e) => handleRoundChange(index, 'name', e.target.value)}
                      className="form-input round-name"
                      placeholder={`Round ${index + 1} name`}
                      required
                    />
                    {rounds.length > 1 && (
                      <button
                        type="button"
                        className="remove-round-button"
                        onClick={() => removeRound(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="round-times">
                    <input
                      type="datetime-local"
                      value={round.startTime}
                      onChange={(e) => handleRoundChange(index, 'startTime', e.target.value)}
                      className="form-input round-time"
                      placeholder="Start time"
                    />
                    <input
                      type="datetime-local"
                      value={round.endTime}
                      onChange={(e) => handleRoundChange(index, 'endTime', e.target.value)}
                      className="form-input round-time"
                      placeholder="End time"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal

