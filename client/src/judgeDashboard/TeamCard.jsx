import { useState } from 'react'
import MarksModal from './MarksModal'
import { getAISummary, refreshAISummary } from '../api/api'
import './TeamCard.css'

function TeamCard({ team, currentScores, onSaveMarks, getTotalScore, teamPPT }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPPTModalOpen, setIsPPTModalOpen] = useState(false)
  const [aiSummary, setAiSummary] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)

  const handleAddMarks = () => {
    setIsModalOpen(true)
  }

  const handleViewPPT = () => {
    if (teamPPT && teamPPT.url) {
      setIsPPTModalOpen(true)
      // Only fetch AI summary if PPT was uploaded to server (has deckId)
      if (teamPPT.deckId) {
        fetchAISummary()
      } else {
        // PPT is only in local state, not uploaded to server
        setAiError('No deck found for this team')
        setAiSummary(null)
      }
    }
  }

  const fetchAISummary = async () => {
    if (!team?.name) return
    
    setAiLoading(true)
    setAiError(null)
    try {
      if (typeof getAISummary === 'function') {
        const data = await getAISummary(team.name)
        console.log('AI Summary fetched:', data)
        
        // Check if summary is still processing
        if (data.status === 'processing' || data.status === 'queued') {
          // Auto-refresh after 3 seconds if still processing
          setTimeout(() => {
            fetchAISummary()
          }, 3000)
        }
        
        setAiSummary(data)
      } else {
        setAiError('AI Summary feature not available')
      }
    } catch (err) {
      setAiError(err?.message || 'Failed to load AI summary')
      console.error('Error fetching AI summary:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const handleRefreshSummary = async () => {
    if (!team?.name) return
    
    setAiLoading(true)
    setAiError(null)
    try {
      if (typeof refreshAISummary === 'function') {
        const data = await refreshAISummary(team.name)
        setAiSummary(data)
      } else {
        setAiError('AI Summary refresh feature not available')
      }
    } catch (err) {
      setAiError(err?.message || 'Failed to refresh AI summary')
      console.error('Error refreshing AI summary:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSave = (teamId, scores) => {
    onSaveMarks(teamId, scores)
  }

  const totalScore = getTotalScore(currentScores)
  const hasScores = currentScores !== null && totalScore > 0

  const getFeasibilityClass = (score) => {
    if (score >= 70) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  // Format summary text with better structure
  const formatSummaryText = (text) => {
    if (!text || text === 'No summary available' || text === 'No future scope analysis available' || text === 'No feasibility analysis available') {
      return <p className="no-content">{text}</p>
    }

    // Split by common patterns and format
    const sections = text.split(/(?=\b(Problem:|Why Now:|Solution:|How It Works|Evidence|What's New|Risks|Next Steps|Evidence\/Results|Risks & Mitigations):)/i)
    
    if (sections.length > 1) {
      return (
        <div className="formatted-summary">
          {sections.map((section, index) => {
            const trimmed = section.trim()
            if (!trimmed) return null
            
            // Check if it's a section header
            const headerMatch = trimmed.match(/^(Problem|Why Now|Solution|How It Works|Evidence|What's New|Risks|Next Steps|Evidence\/Results|Risks & Mitigations):/i)
            
            if (headerMatch) {
              const header = headerMatch[0]
              const content = trimmed.replace(header, '').trim()
              return (
                <div key={index} className="summary-section">
                  <h4 className="section-header">{header}</h4>
                  <p className="section-content">{content}</p>
                </div>
              )
            }
            
            // Regular paragraph
            return (
              <p key={index} className="summary-paragraph">
                {trimmed}
              </p>
            )
          })}
        </div>
      )
    }
    
    // If no sections found, split by double periods or newlines
    const paragraphs = text.split(/\.\.|\.\s+(?=[A-Z])/).filter(p => p.trim())
    
    if (paragraphs.length > 1) {
      return (
        <div className="formatted-summary">
          {paragraphs.map((para, index) => (
            <p key={index} className="summary-paragraph">
              {para.trim()}{para.trim().endsWith('.') ? '' : '.'}
            </p>
          ))}
        </div>
      )
    }
    
    // Fallback: just display as is
    return <p className="summary-paragraph">{text}</p>
  }

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
                  <span className="breakdown-label">Innovation:</span>
                  <span className="breakdown-value">{currentScores.innovation || 0}/10</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Technical:</span>
                  <span className="breakdown-value">{currentScores.technical || 0}/10</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Presentation:</span>
                  <span className="breakdown-value">{currentScores.presentation || 0}/5</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Problem Solving:</span>
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
              
              {/* AI Summary Section */}
              <div className="ai-summary-container">
                <div className="ai-summary-header">
                  <h3 className="ai-summary-title">
                    AI Summary
                  </h3>
                  <button 
                    onClick={handleRefreshSummary}
                    className="refresh-ai-button"
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'Refreshing...' : 'Refresh Analysis'}
                  </button>
                </div>
                
                {aiLoading && !aiSummary && (
                  <div className="ai-summary-loading">
                    <div className="loading-spinner"></div>
                    <p>Analyzing presentation...</p>
                  </div>
                )}
                
                {aiError && (
                  <div className="ai-summary-error">
                    <p>{aiError}</p>
                    {(aiError.includes('No deck found') || aiError.includes('No presentation') || !teamPPT?.deckId) ? (
                      <div className="error-help">
                        <p className="error-help-text">
                          {teamPPT?.deckId 
                            ? 'The presentation needs to be uploaded through the participant dashboard first. Once uploaded, the AI summary will be generated automatically.'
                            : 'This PPT is only stored locally. Please upload it through the participant dashboard to enable AI summary generation. The PPT shown below is from local storage and cannot be analyzed until uploaded to the server.'}
                        </p>
                        {!teamPPT?.deckId && (
                          <div className="upload-warning">
                            <p className="warning-text">
                              Note: The PPT viewer below shows the file from local storage. To get AI analysis, the PPT must be uploaded to the server through the participant dashboard.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button onClick={fetchAISummary} className="retry-button">
                        Retry
                      </button>
                    )}
                  </div>
                )}
                
                {aiSummary && (aiSummary.status === 'processing' || aiSummary.status === 'queued') && (
                  <div className="ai-summary-loading">
                    <div className="loading-spinner"></div>
                    <p>{aiSummary.summary || 'Analysis in progress...'}</p>
                    <p className="processing-note">This will refresh automatically...</p>
                  </div>
                )}
                
                {aiSummary && !aiSummary.status && (
                  <div className="ai-summary-content">
                    <div className="ai-summary-item">
                      <div className="ai-summary-label">
                        <strong>Idea Summary</strong>
                      </div>
                      <div className="ai-summary-text formatted-text">
                        {formatSummaryText(aiSummary.summary || 'No summary available')}
                      </div>
                    </div>
                    
                    <div className="ai-summary-item">
                      <div className="ai-summary-label">
                        <strong>Future Scope</strong>
                      </div>
                      <div className="ai-summary-text formatted-text">
                        {formatSummaryText(aiSummary.futureScope || 'No future scope analysis available')}
                      </div>
                    </div>
                    
                    <div className="ai-summary-item">
                      <div className="ai-summary-label">
                        <strong>Feasibility</strong>
                      </div>
                      <div className="feasibility-content">
                        <div className="ai-summary-text formatted-text">
                          {formatSummaryText(aiSummary.feasibility || 'No feasibility analysis available')}
                        </div>
                        {aiSummary.feasibilityScore && (
                          <div className="feasibility-score">
                            <div className="score-bar-container">
                              <div 
                                className={`score-bar ${getFeasibilityClass(aiSummary.feasibilityScore)}`}
                                style={{ width: `${aiSummary.feasibilityScore}%` }}
                              ></div>
                            </div>
                            <span className="score-text">{aiSummary.feasibilityScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ppt-preview">
                {teamPPT.fileName?.toLowerCase().endsWith('.pdf') ? (
                  <embed
                    src={teamPPT.url}
                    type="application/pdf"
                    className="ppt-iframe"
                    title={teamPPT.fileName}
                  />
                ) : teamPPT.fileName?.toLowerCase().endsWith('.pptx') || teamPPT.fileName?.toLowerCase().endsWith('.ppt') ? (
                  <div className="ppt-viewer-container">
                    <p className="ppt-viewer-note">
                      PowerPoint files cannot be displayed inline in the browser.
                      <br />
                      Please download the file to view it.
                    </p>
                  </div>
                ) : (
                  <iframe 
                    src={teamPPT.url}
                    title={teamPPT.fileName}
                    className="ppt-iframe"
                  />
                )}
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

