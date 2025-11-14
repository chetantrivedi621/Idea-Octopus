import { useState, useRef } from 'react'
import './PPTUploadSection.css'

function PPTUploadSection({ teamPPT, onUploadPPT, teamName }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)
  const currentTeamId = 1 // In a real app, you'd get the current user's teamId

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf'
    ]
    const validExtensions = ['.ppt', '.pptx', '.pdf']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Please upload a PPT, PPTX, or PDF file')
      return
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      setError('File size must be less than 50MB')
      return
    }

    setError('')
    setSuccess('')
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress (in real app, use actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload to server with team name
      const result = await onUploadPPT(currentTeamId, file, teamName || `Team ${currentTeamId}`)
      setUploadProgress(100)
      clearInterval(progressInterval)
      setIsUploading(false)
      setSuccess(`PPT uploaded successfully! Deck ID: ${result.deckId}, Job ID: ${result.jobId}. AI summary will be generated shortly.`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('')
        setUploadProgress(0)
      }, 5000)
    } catch (err) {
      setError(err?.message || 'Failed to upload PPT. Please try again.')
      setIsUploading(false)
      setUploadProgress(0)
      console.error('Upload error:', err)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      const fakeEvent = { target: { files: [file] } }
      handleFileSelect(fakeEvent)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemovePPT = () => {
    // In a real app, you'd call a remove handler
    // For now, we'll just clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <section className="ppt-upload-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">📄</span>
          Final Presentation Upload
        </h2>
      </div>
      
      <div className="ppt-upload-card">
        {teamPPT ? (
          <div className="ppt-uploaded">
            <div className="uploaded-info">
              <span className="uploaded-icon">✅</span>
              <div className="uploaded-details">
                <span className="uploaded-file-name">{teamPPT.fileName}</span>
                <span className="uploaded-file-size">
                  {(teamPPT.fileSize / (1024 * 1024)).toFixed(2)} MB
                </span>
                {teamPPT.deckId ? (
                  <span className="upload-status server-uploaded">
                    ✓ Uploaded to server (Deck ID: {teamPPT.deckId?.toString().slice(-8)})
                  </span>
                ) : (
                  <span className="upload-status local-only">
                    ⚠ Only stored locally - Click "Re-upload to Server" to enable AI analysis
                  </span>
                )}
              </div>
            </div>
            <div className="uploaded-actions">
              {!teamPPT.deckId && (
                <button 
                  className="reupload-button"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Re-upload to Server'}
                </button>
              )}
              <button 
                className="change-ppt-button"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Change PPT'}
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={`ppt-upload-area ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="upload-icon">📄</div>
            <h3 className="upload-title">Upload Your Final Presentation</h3>
            <p className="upload-description">
              Drag & drop your file here or click to browse
            </p>
            <p className="upload-hint">PPT / PPTX / PDF (max 50MB)</p>
            {error && <p className="upload-error">❌ {error}</p>}
            {success && <p className="upload-success">✅ {success}</p>}
            {uploadProgress > 0 && (
              <div className="upload-progress-container">
                <div className="upload-progress-bar">
                  <div 
                    className="upload-progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="upload-progress-text">{uploadProgress}%</span>
              </div>
            )}
            <button 
              className="upload-button"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </section>
  )
}

export default PPTUploadSection

