import { useState } from 'react'
import './AddJudgeModal.css'

function AddJudgeModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name.trim()) {
      setError('Please enter the judge\'s name')
      return
    }

    if (!email.trim()) {
      setError('Please enter the judge\'s email')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    if (!password) {
      setError('Please enter a password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        password
      })
      
      // Reset form only on success
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setError('')
      onClose()
    } catch (err) {
      // Error is handled by parent component, but show it here too
      setError(err.message || 'Failed to create judge')
    }
  }

  const handleClose = () => {
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content add-judge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Judge</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="add-judge-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              className={`form-input ${error && !name.trim() ? 'error' : ''}`}
              placeholder="Enter judge's name"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className={`form-input ${error && !email.trim() ? 'error' : ''}`}
              placeholder="Enter judge's email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className={`form-input ${error && (!password || password.length < 6) ? 'error' : ''}`}
              placeholder="Enter password (min 6 characters)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError('')
              }}
              className={`form-input ${error && password !== confirmPassword ? 'error' : ''}`}
              placeholder="Confirm password"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Add Judge
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddJudgeModal

