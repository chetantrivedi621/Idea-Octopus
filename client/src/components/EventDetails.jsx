import { useState, useEffect, useCallback } from 'react'
import './EventDetails.css'

function EventDetails({ event, onClose }) {
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [currentRound, setCurrentRound] = useState(null)

  const updateCurrentRound = useCallback(() => {
    if (!event || !event.rounds || event.rounds.length === 0) {
      setCurrentRound(null)
      return
    }

    const now = Date.now()
    const sortedRounds = [...event.rounds].sort((a, b) => {
      const aStart = a.startTime ? new Date(a.startTime).getTime() : 0
      const bStart = b.startTime ? new Date(b.startTime).getTime() : 0
      return aStart - bStart
    })

    // Find the current active round
    let activeRound = null
    for (const round of sortedRounds) {
      const startTime = round.startTime ? new Date(round.startTime).getTime() : null
      const endTime = round.endTime ? new Date(round.endTime).getTime() : null

      if (startTime && endTime) {
        if (now >= startTime && now <= endTime) {
          activeRound = round
          break
        }
      } else if (startTime && now >= startTime) {
        activeRound = round
        break
      }
    }

    setCurrentRound(activeRound)
  }, [event])

  useEffect(() => {
    updateCurrentRound()
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
      updateCurrentRound()
    }, 1000)

    return () => clearInterval(interval)
  }, [updateCurrentRound])

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = (endTime) => {
    if (!endTime) return null
    const end = new Date(endTime).getTime()
    const now = currentTime
    const diff = end - now

    if (diff <= 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  const getRoundStatus = (round) => {
    if (!round.startTime) return 'upcoming'
    
    const now = currentTime
    const startTime = new Date(round.startTime).getTime()
    const endTime = round.endTime ? new Date(round.endTime).getTime() : null

    if (endTime && now > endTime) return 'completed'
    if (now >= startTime && (!endTime || now <= endTime)) return 'active'
    return 'upcoming'
  }

  if (!event) return null

  const sortedRounds = [...(event.rounds || [])].sort((a, b) => {
    const aOrder = a.order || 0
    const bOrder = b.order || 0
    return aOrder - bOrder
  })

  return (
    <div className="event-details-overlay" onClick={onClose}>
      <div className="event-details-content" onClick={(e) => e.stopPropagation()}>
        <div className="event-details-header">
          <div>
            <h2 className="event-details-title">{event.name}</h2>
            {event.location && (
              <p className="event-details-location">📍 {event.location}</p>
            )}
          </div>
          <button className="event-details-close" onClick={onClose}>×</button>
        </div>

        {event.description && (
          <div className="event-details-description">
            <p>{event.description}</p>
          </div>
        )}

        <div className="event-details-dates">
          <div className="event-date-item">
            <span className="event-date-label">Start:</span>
            <span className="event-date-value">{formatDate(event.startDate)}</span>
          </div>
          <div className="event-date-item">
            <span className="event-date-label">End:</span>
            <span className="event-date-value">{formatDate(event.endDate)}</span>
          </div>
        </div>

        <div className="event-timeline-section">
          <h3 className="timeline-title">Event Timeline</h3>
          <div className="timeline-container">
            {sortedRounds.map((round, index) => {
              const status = getRoundStatus(round)
              const roundId = round._id || round.id || index
              const currentRoundId = currentRound ? (currentRound._id || currentRound.id) : null
              const isCurrent = currentRound && roundId === currentRoundId
              const timeRemaining = round.endTime ? getTimeRemaining(round.endTime) : null

              return (
                <div
                  key={roundId}
                  className={`timeline-item ${status} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="timeline-marker">
                    {isCurrent && <div className="timeline-pulse"></div>}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4 className="timeline-round-name">{round.name}</h4>
                      {isCurrent && (
                        <span className="current-badge">Current Round</span>
                      )}
                      <span className={`status-badge ${status}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <div className="timeline-dates">
                      <div className="timeline-date">
                        <span className="timeline-date-label">Start:</span>
                        <span>{formatDate(round.startTime)}</span>
                      </div>
                      <div className="timeline-date">
                        <span className="timeline-date-label">End:</span>
                        <span>{formatDate(round.endTime)}</span>
                      </div>
                    </div>
                    {isCurrent && timeRemaining && (
                      <div className="timeline-countdown">
                        <span className="countdown-label">Time Remaining:</span>
                        <span className="countdown-value">{timeRemaining}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails

