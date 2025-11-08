import { useState } from 'react'
import IdeaCard from './IdeaCard'
import './YourIdeasBoardSection.css'

function YourIdeasBoardSection({ ideas, onAddIdea }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    description: ''
  })
  const [errors, setErrors] = useState({})

  // Get ideas for the current participant's team (assuming teamId 1 for now)
  // In a real app, you'd get the current user's teamId
  const currentTeamId = 1
  const teamIdeas = ideas[currentTeamId] || []

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setFormData({ title: '', category: 'General', description: '' })
    setErrors({})
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({ title: '', category: 'General', description: '' })
    setErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onAddIdea(currentTeamId, formData)
    handleCloseModal()
  }

  return (
    <>
      <section className="your-ideas-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">⭐</span>
            Your Ideas Board
          </h2>
          <button className="add-note-button" onClick={handleOpenModal}>
            <span>+</span>
            Add Sticky Note
          </button>
        </div>
        <div className="ideas-grid">
          {teamIdeas.length === 0 ? (
            <div className="no-ideas-message">
              <p>No ideas yet. Click "Add Sticky Note" to share your first idea!</p>
            </div>
          ) : (
            teamIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                title={idea.title}
                category={idea.category}
                hearts={idea.hearts}
                fires={idea.fires}
                stars={idea.stars}
                votes={idea.votes}
              />
            ))
          )}
        </div>
      </section>

      {/* Idea Upload Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content idea-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Idea</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="idea-form">
              <div className="form-group">
                <label htmlFor="title">Idea Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={errors.title ? 'error' : ''}
                  placeholder="Enter your idea title"
                />
                {errors.title && <p className="error-message">{errors.title}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="General">General</option>
                  <option value="EdTech">EdTech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="AI">AI</option>
                  <option value="Funny Ideas">Funny Ideas</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe your idea (optional)"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Add Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default YourIdeasBoardSection

