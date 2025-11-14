import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTeamIdeas, getTeamByName, getTeam } from '../api/api'
import Whiteboard from '../components/Whiteboard'
import './TeamIdeaBoard.css'

export default function TeamIdeaBoard() {
  const navigate = useNavigate()
  const [team, setTeam] = useState(null)
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('ideas') // 'ideas' or 'whiteboard'
  const [teamId, setTeamId] = useState(null)
  const [stickyNotes, setStickyNotes] = useState([])

  useEffect(() => {
    const loadTeamAndIdeas = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get team from localStorage (set during login)
        const teamInfo = JSON.parse(localStorage.getItem('team') || 'null')
        const teamId = teamInfo?._id || localStorage.getItem('teamId')
        
        if (!teamInfo && !teamId) {
          throw new Error('Team not found. Please log in again.')
        }

        // If we have team info in localStorage, use it directly
        // Otherwise, fetch it by ID
        let teamData = teamInfo
        if (!teamData && teamId) {
          try {
            teamData = await getTeam(teamId)
          } catch (fetchErr) {
            // If fetching by ID fails, try to get by name as fallback
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            if (user.teamName) {
              teamData = await getTeamByName(user.teamName)
            }
          }
        }
        
        if (!teamData) {
          throw new Error('Team not found')
        }

        setTeam(teamData)
        setTeamId(teamData._id)

        // Get ideas for this team
        const teamIdeas = await getTeamIdeas(teamData._id)
        setIdeas(teamIdeas || [])
      } catch (err) {
        console.error('Error loading team and ideas:', err)
        setError(err?.message || 'Failed to load team information')
      } finally {
        setLoading(false)
      }
    }

    loadTeamAndIdeas()
  }, [])

  const getTotalContributions = (idea) => {
    return (idea.hearts || 0) + (idea.fires || 0) + (idea.stars || 0) + (idea.votes || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
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

  if (loading) {
    return (
      <div className="team-idea-board">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading team information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="team-idea-board">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="team-idea-board">
      <div className="board-container">
        <div className="board-header">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
          <h1 className="board-title">Collaborative Idea Board</h1>
        </div>

        {/* Tabs */}
        <div className="board-tabs">
          <button 
            className={`tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ideas')}
          >
            💡 Ideas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'whiteboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('whiteboard')}
          >
            🎨 Whiteboard
          </button>
        </div>

        {/* Whiteboard View */}
        {activeTab === 'whiteboard' && teamId && (
          <div className="whiteboard-section">
            <Whiteboard teamId={teamId} onStickyNotesChange={setStickyNotes} />
          </div>
        )}

        {/* Ideas View */}
        {activeTab === 'ideas' && (
        <div className="ideas-section">
          <div className="ideas-header">
            <h2 className="ideas-title">Team Ideas</h2>
            <span className="ideas-count">
              {ideas.length + stickyNotes.length} {ideas.length + stickyNotes.length === 1 ? 'idea' : 'ideas'}
            </span>
          </div>

          {/* Sticky Notes from Whiteboard */}
          {stickyNotes.length > 0 && (
            <div className="sticky-notes-section">
              <h3 className="sticky-notes-title">📝 Sticky Notes</h3>
              <div className="sticky-notes-grid">
                {stickyNotes.map(sticky => (
                  <div 
                    key={sticky.id} 
                    className="sticky-note-card"
                    style={{ backgroundColor: sticky.color }}
                  >
                    <div className="sticky-note-text">{sticky.text || 'Empty note'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Ideas */}
          {ideas.length === 0 && stickyNotes.length === 0 ? (
            <div className="no-ideas">
              <div className="no-ideas-icon">💡</div>
              <p>No ideas yet. Be the first to share an idea!</p>
            </div>
          ) : (
            <div className="ideas-grid">
              {ideas.map((idea) => {
                const contributions = getTotalContributions(idea)
                const shortSummary = idea.description 
                  ? (idea.description.length > 150 
                      ? idea.description.substring(0, 150) + '...' 
                      : idea.description)
                  : 'No description available'

                return (
                  <div key={idea._id} className="idea-card">
                    <div className="idea-card-header">
                      <h3 className="idea-name">{idea.title}</h3>
                      {idea.category && (
                        <span className="idea-category-badge">{idea.category}</span>
                      )}
                    </div>
                    <p className="idea-summary">{shortSummary}</p>
                    <div className="idea-metrics">
                      <div className="metric-item">
                        <span className="metric-label">Contributions</span>
                        <span className="metric-value">{contributions}</span>
                      </div>
                      <div className="metric-breakdown">
                        {idea.hearts > 0 && (
                          <div className="reaction-item">
                            <span className="reaction-icon">❤️</span>
                            <span className="reaction-count">{idea.hearts}</span>
                          </div>
                        )}
                        {idea.fires > 0 && (
                          <div className="reaction-item">
                            <span className="reaction-icon">🔥</span>
                            <span className="reaction-count">{idea.fires}</span>
                          </div>
                        )}
                        {idea.stars > 0 && (
                          <div className="reaction-item">
                            <span className="reaction-icon">⭐</span>
                            <span className="reaction-count">{idea.stars}</span>
                          </div>
                        )}
                        {idea.votes > 0 && (
                          <div className="reaction-item">
                            <span className="reaction-icon">👍</span>
                            <span className="reaction-count">{idea.votes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="idea-footer">
                      <span className="idea-date">{formatDate(idea.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

