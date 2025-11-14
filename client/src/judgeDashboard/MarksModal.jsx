import { useState, useEffect } from 'react'
import './MarksModal.css'

const CRITERIA = [
  { id: 'innovation', label: 'Innovation & Creativity', max: 10, icon: '' },
  { id: 'technical', label: 'Technical Implementation', max: 10, icon: '' },
  { id: 'presentation', label: 'Presentation & Demo', max: 5, icon: '' },
  { id: 'problemSolving', label: 'Problem Solving', max: 5, icon: '' }
]

function MarksModal({ team, isOpen, onClose, onSave, currentScores }) {
  const [scores, setScores] = useState({
    innovation: 0,
    technical: 0,
    presentation: 0,
    problemSolving: 0
  })
  const [errors, setErrors] = useState({})
  const [totalScore, setTotalScore] = useState(0)

  useEffect(() => {
    if (isOpen && currentScores) {
      setScores(currentScores)
    } else if (isOpen) {
      setScores({
        innovation: 0,
        technical: 0,
        presentation: 0,
        problemSolving: 0
      })
    }
  }, [isOpen, currentScores])

  useEffect(() => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0)
    setTotalScore(total)
  }, [scores])

  if (!isOpen) return null

  const handleScoreChange = (criterionId, value) => {
    const numValue = parseInt(value) || 0
    const criterion = CRITERIA.find(c => c.id === criterionId)
    
    if (numValue < 0 || numValue > criterion.max) {
      setErrors(prev => ({
        ...prev,
        [criterionId]: `Must be between 0 and ${criterion.max}`
      }))
      return
    }

    setScores(prev => ({
      ...prev,
      [criterionId]: numValue
    }))
    
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[criterionId]
      return newErrors
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) {
      return
    }

    onSave(team.id, scores)
    onClose()
  }

  const handleClose = () => {
    setScores({
      innovation: 0,
      technical: 0,
      presentation: 0,
      problemSolving: 0
    })
    setErrors({})
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Evaluate {team.name}</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="marks-form">
          <div className="criteria-list">
            {CRITERIA.map((criterion) => (
              <div key={criterion.id} className="criterion-group">
                <label htmlFor={criterion.id} className="criterion-label">
                  <span className="criterion-text">
                    {criterion.label}
                    <span className="criterion-max">(out of {criterion.max})</span>
                  </span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id={criterion.id}
                    min="0"
                    max={criterion.max}
                    value={scores[criterion.id]}
                    onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                    className={`marks-input ${errors[criterion.id] ? 'error' : ''}`}
                  />
                  <div className="score-indicator">
                    {scores[criterion.id]} / {criterion.max}
                  </div>
                </div>
                {errors[criterion.id] && (
                  <p className="error-message">{errors[criterion.id]}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="total-score-section">
            <div className="total-score-label">Total Score</div>
            <div className="total-score-value">{totalScore} / 30</div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Marks
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MarksModal

