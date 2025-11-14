import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { getTeamIdeas } from '../api/api'
import './CollaborativeIdeaBoardCard.css'

function CollaborativeIdeaBoardCard() {
  const navigate = useNavigate()
  
  // Get team information from localStorage
  const teamInfo = JSON.parse(localStorage.getItem('team') || 'null')
  const teamId = teamInfo?._id || localStorage.getItem('teamId')
  
  // Get socket connection and active members
  const { isConnected, activeMembers } = useSocket(teamId)
  
  // State for ideas and last updated time
  const [ideas, setIdeas] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch ideas for the team
  useEffect(() => {
    const loadIdeas = async () => {
      if (!teamId) {
        setLoading(false)
        return
      }
      
      try {
        const teamIdeas = await getTeamIdeas(teamId)
        setIdeas(teamIdeas || [])
        
        // Find the most recent idea's timestamp
        if (teamIdeas && teamIdeas.length > 0) {
          const sortedIdeas = [...teamIdeas].sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0)
            const dateB = new Date(b.updatedAt || b.createdAt || 0)
            return dateB - dateA
          })
          setLastUpdated(sortedIdeas[0].updatedAt || sortedIdeas[0].createdAt)
        }
      } catch (error) {
        console.error('Error loading ideas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadIdeas()
    
    // Refresh ideas every 30 seconds
    const interval = setInterval(loadIdeas, 30000)
    return () => clearInterval(interval)
  }, [teamId])

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const handleOpenBoard = () => {
    navigate('/team-idea-board')
  }

  // Calculate active teammates count
  // Note: activeMembers from socket includes all active members in the team room
  const activeTeammatesCount = isConnected && activeMembers ? activeMembers.length : 0
  const ideasCount = ideas.length
  
  // Show "No team" message if no team data
  if (!teamId && !loading) {
    return (
      <div className="collaborative-board-card">
        <div className="board-card-left">
          <div className="board-icon">📁⚡</div>
          <div className="board-content">
            <div className="board-header">
              <h2 className="board-title">Collaborative Idea Board</h2>
              <div className="board-indicator">
                <span className="indicator-dot" style={{ background: '#f44336' }}></span>
                <span className="indicator-text">No Team</span>
              </div>
            </div>
            <p className="board-description">
              Please log in with your team credentials to access the collaborative idea board.
            </p>
            <div className="board-stats">
              <span>No team assigned</span>
            </div>
          </div>
        </div>
        <div className="board-card-right">
          <button className="open-board-button" disabled style={{ opacity: 0.5 }}>
            <span>➤</span>
            Open Board
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="collaborative-board-card">
      <div className="board-card-left">
        <div className="board-icon">📁⚡</div>
        <div className="board-content">
          <div className="board-header">
            <h2 className="board-title">Collaborative Idea Board</h2>
            <div className="board-indicator">
              <span className="indicator-dot"></span>
              <span className="indicator-text">Active</span>
            </div>
          </div>
          <p className="board-description">
            Jump into the live whiteboard where your team can brainstorm together. 
            Drag sticky notes, vote on ideas, and collaborate in real-time with your teammates!
          </p>
          <div className="board-stats">
            <span>
              {loading ? '...' : activeTeammatesCount} teammate{activeTeammatesCount !== 1 ? 's' : ''} online
            </span>
            <span>•</span>
            <span>
              {loading ? '...' : ideasCount} active idea{ideasCount !== 1 ? 's' : ''}
            </span>
            <span>•</span>
            <span>
              {loading ? '...' : formatTimeAgo(lastUpdated)}
            </span>
          </div>
        </div>
      </div>
      <div className="board-card-right">
        <button className="open-board-button" onClick={handleOpenBoard}>
          <span>➤</span>
          Open Board
        </button>
      </div>
    </div>
  )
}

export default CollaborativeIdeaBoardCard

