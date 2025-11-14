import { useState, useEffect } from 'react'
import './CurrentRoundDisplay.css'

function CurrentRoundDisplay({ currentRound, isReadOnly = true }) {
  const [timeRemaining, setTimeRemaining] = useState(null)

  useEffect(() => {
    if (!currentRound || !currentRound.endTime) {
      setTimeRemaining(null)
      return
    }

    const updateTimeRemaining = () => {
      const now = Date.now()
      
      // Handle endTime - could be a number (timestamp) or Date object
      const endTime = typeof currentRound.endTime === 'number' 
        ? currentRound.endTime 
        : new Date(currentRound.endTime).getTime()
      
      const remaining = endTime - now
      
      if (remaining <= 0) {
        setTimeRemaining('Round ended')
        return
      }
      
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m remaining`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`)
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s remaining`)
      } else {
        setTimeRemaining(`${seconds}s remaining`)
      }
    }

    // Update immediately
    updateTimeRemaining()

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [currentRound])

  if (!currentRound) {
    return (
      <div className="current-round-display no-round">
        <div className="round-info">
          <span className="round-label">Current Round</span>
          <span className="round-name">No round active</span>
        </div>
      </div>
    )
  }

  const getStatusColor = () => {
    switch (currentRound.status) {
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

  const formatDateTime = (time) => {
    if (!time) return null
    const date = typeof time === 'number' ? new Date(time) : new Date(time)
    return date.toLocaleString()
  }

  const isActive = currentRound.status === 'active'
  
  return (
    <div className="current-round-display" style={{ '--status-color': getStatusColor() }}>
      <div className={`round-status-dot ${isActive ? 'active' : 'inactive'}`} style={{ backgroundColor: getStatusColor() }}></div>
      <div className="round-info">
        <div className="round-status-header">
          <span className="round-label">Current Round</span>
          <span className={`round-status-text ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Round Active' : 'No round active'}
          </span>
        </div>
        <span className="round-name">{currentRound.name}</span>
        <div className="round-times">
          {currentRound.startTime && (
            <span className="round-time">
              <strong>Start:</strong> {formatDateTime(currentRound.startTime)}
            </span>
          )}
          {currentRound.endTime && (
            <span className="round-time">
              <strong>End:</strong> {formatDateTime(currentRound.endTime)}
            </span>
          )}
          {timeRemaining && isActive && (
            <span className="round-time-remaining">
              Submissions close in: {timeRemaining}
            </span>
          )}
        </div>
      </div>
      <div className="round-status-badge" style={{ backgroundColor: getStatusColor() }}>
        {currentRound.status.charAt(0).toUpperCase() + currentRound.status.slice(1)}
      </div>
    </div>
  )
}

export default CurrentRoundDisplay

