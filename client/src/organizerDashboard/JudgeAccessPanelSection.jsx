import { useState, useEffect } from 'react'
import JudgeCard from './JudgeCard'
import AddJudgeModal from './AddJudgeModal'
import { getJudges, createJudge, deleteJudge } from '../api/api'
import './JudgeAccessPanelSection.css'

function JudgeAccessPanelSection() {
  const [judges, setJudges] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchJudges()
  }, [])

  const fetchJudges = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getJudges()
      setJudges(data || [])
    } catch (err) {
      console.error('Error fetching judges:', err)
      setError(err.message || 'Failed to fetch judges')
    } finally {
      setLoading(false)
    }
  }

  const handleAddJudge = async (judgeData) => {
    try {
      setError('')
      const newJudge = await createJudge(judgeData)
      setJudges([newJudge, ...judges])
      setIsModalOpen(false)
    } catch (err) {
      console.error('Error creating judge:', err)
      const errorMessage = err.message || 'Failed to create judge'
      setError(errorMessage)
      // Don't close modal on error - let user see the error and try again
      throw new Error(errorMessage)
    }
  }

  const handleDeleteJudge = async (judgeId) => {
    if (!window.confirm('Are you sure you want to delete this judge?')) {
      return
    }

    try {
      setError('')
      await deleteJudge(judgeId)
      setJudges(judges.filter(judge => judge.id !== judgeId))
    } catch (err) {
      console.error('Error deleting judge:', err)
      setError(err.message || 'Failed to delete judge')
    }
  }

  return (
    <section className="judge-access-panel-section">
      <div className="section-header">
        <h2 className="section-title">Judge Access Panel</h2>
        <button 
          className="add-judge-button"
          onClick={() => setIsModalOpen(true)}
        >
          <span>+</span>
          Add Judge
        </button>
      </div>
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
      {loading ? (
        <div className="loading-state">
          Loading judges...
        </div>
      ) : judges.length === 0 ? (
        <div className="empty-state">
          No judges found. Click "Add Judge" to add one.
        </div>
      ) : (
        <div className="judges-list">
          {judges.map((judge) => (
            <JudgeCard
              key={judge.id}
              id={judge.id}
              name={judge.name}
              email={judge.email}
              status={judge.status}
              onDelete={handleDeleteJudge}
            />
          ))}
        </div>
      )}
      <AddJudgeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setError('')
        }}
        onSave={handleAddJudge}
      />
    </section>
  )
}

export default JudgeAccessPanelSection

