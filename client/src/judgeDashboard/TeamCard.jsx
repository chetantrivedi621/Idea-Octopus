import { useState } from 'react'
import MarksModal from './MarksModal'
import './TeamCard.css'

function TeamCard({ team, currentScores, onSaveMarks, getTotalScore, teamPPT }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPPTModalOpen, setIsPPTModalOpen] = useState(false)

  const handleAddMarks = () => {
    setIsModalOpen(true)
  }

  const handleViewPPT = () => {
    if (teamPPT && teamPPT.url) {
      setIsPPTModalOpen(true)
    }
  }

  const handleSave = (teamId, scores) => {
    onSaveMarks(teamId, scores)
  }

  const totalScore = getTotalScore(currentScores)
  const hasScores = currentScores !== null && totalScore > 0

  return (
    <>
      <div className="team-card">
        <div className="card-header">
          <h3 className="team-name">{team.name}</h3>
          <span className="category-badge">{team.category}</span>
        </div>
        <p className="team-description">{team.description}</p>
        
        {/* PPT Upload Status */}
        {teamPPT ? (
          <div className="ppt-status-section">
            <div className="ppt-status-info">
              <span className="ppt-icon">📄</span>
              <div className="ppt-details">
                <span className="ppt-file-name">{teamPPT.fileName}</span>
                <span className="ppt-file-size">
                  {(teamPPT.fileSize / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="ppt-status-section no-ppt">
            <span className="ppt-icon">📄</span>
            <span className="ppt-status-text">No PPT uploaded yet</span>
          </div>
        )}

        {hasScores && (
          <div className="current-score">
            <span className="score-label">Total Score:</span>
            <span className="score-value">{totalScore} / 30</span>
            {currentScores && (
              <div className="score-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">💡 Innovation:</span>
                  <span className="breakdown-value">{currentScores.innovation || 0}/10</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">⚙️ Technical:</span>
                  <span className="breakdown-value">{currentScores.technical || 0}/10</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">🎤 Presentation:</span>
                  <span className="breakdown-value">{currentScores.presentation || 0}/5</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">🧩 Problem Solving:</span>
                  <span className="breakdown-value">{currentScores.problemSolving || 0}/5</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="card-actions">
          <button className="add-marks-button" onClick={handleAddMarks}>
            {hasScores ? 'Update Marks' : 'Add Marks'}
          </button>
          <button 
            className={`view-ppt-button ${!teamPPT ? 'disabled' : ''}`} 
            onClick={handleViewPPT}
            disabled={!teamPPT}
          >
            {teamPPT ? 'View PPT' : 'No PPT'}
          </button>
        </div>
      </div>
      <MarksModal
        team={team}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        currentScores={currentScores}
      />
      
      {/* PPT View Modal */}
      {isPPTModalOpen && teamPPT && (
        <div className="modal-overlay" onClick={() => setIsPPTModalOpen(false)}>
          <div className="modal-content ppt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">View PPT - {team.name}</h2>
              <button className="modal-close" onClick={() => setIsPPTModalOpen(false)}>×</button>
            </div>
            <div className="ppt-viewer">
              <div className="ppt-info">
                <p><strong>File:</strong> {teamPPT.fileName}</p>
                <p><strong>Size:</strong> {(teamPPT.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <div className="ppt-preview">
                <iframe 
                  src={teamPPT.url} 
                  title={teamPPT.fileName}
                  className="ppt-iframe"
                />
                <div className="ppt-actions">
                  <a 
                    href={teamPPT.url} 
                    download={teamPPT.fileName}
                    className="download-ppt-button"
                  >
                    Download PPT
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TeamCard

