import { useState, useRef } from 'react'
import './PPTUploadSection.css'

function PPTUploadSection({ teamPPT, onUploadPPT }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const currentTeamId = 1 // In a real app, you'd get the current user's teamId

  const handleFileSelect = (e) => {
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
    setIsUploading(true)

    // Simulate upload delay
    setTimeout(() => {
      onUploadPPT(currentTeamId, file)
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }, 500)
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
              </div>
            </div>
            <div className="uploaded-actions">
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
          <div className="ppt-upload-area">
            <div className="upload-icon">📄</div>
            <h3 className="upload-title">Upload Your Final Presentation</h3>
            <p className="upload-description">
              Upload your PPT, PPTX, or PDF file (max 50MB)
            </p>
            {error && <p className="upload-error">{error}</p>}
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

