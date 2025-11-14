import { useState } from 'react'
import { uploadImage, getImageUrl } from '../api/api'
import './ImageUploadSection.css'

function ImageUploadSection({ eventId, onImageUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState('banner')
  const [preview, setPreview] = useState(null)
  const [uploadedFilename, setUploadedFilename] = useState(null)
  const [error, setError] = useState('')

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB')
      return
    }

    setError('')
    setPreview(URL.createObjectURL(file))
    setUploadedFilename(null)
  }

  const handleUpload = async () => {
    const fileInput = document.getElementById('image-upload-input')
    const file = fileInput?.files[0]
    
    if (!file) {
      setError('Please select an image file')
      return
    }

    setUploading(true)
    setError('')

    try {
      const result = await uploadImage({ file, type: uploadType })
      
      if (result.success) {
        setUploadedFilename(result.filename)
        setPreview(getImageUrl(result.filename))
        
        // Notify parent component
        if (onImageUploaded) {
          onImageUploaded({
            type: uploadType,
            filename: result.filename,
            fileId: result.fileId
          })
        }
      } else {
        setError('Upload failed. Please try again.')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setPreview(null)
    setUploadedFilename(null)
    setError('')
    const fileInput = document.getElementById('image-upload-input')
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="image-upload-section">
      <h3 className="upload-section-title">📸 Upload Images to GridFS</h3>
      
      <div className="upload-type-selector">
        <label className="upload-type-label">Image Type:</label>
        <select 
          value={uploadType} 
          onChange={(e) => {
            setUploadType(e.target.value)
            handleReset()
          }}
          className="upload-type-select"
        >
          <option value="banner">Event Banner</option>
          <option value="winner">Winner Photo</option>
          <option value="gallery">Gallery Image</option>
          <option value="memory">Memory Photo</option>
          <option value="general">General</option>
        </select>
      </div>

      <div className="upload-area">
        <input
          id="image-upload-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="upload-input"
        />
        
        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            {uploadedFilename && (
              <div className="upload-success">
                <p className="success-message">Uploaded successfully!</p>
                <p className="filename-display">Filename: {uploadedFilename}</p>
                <p className="image-url">
                  URL: <code>{getImageUrl(uploadedFilename)}</code>
                </p>
              </div>
            )}
          </div>
        )}

        {!preview && (
          <div className="upload-placeholder">
            <p className="upload-text">Click to select an image</p>
            <p className="upload-hint">Max size: 10MB (JPEG, PNG, GIF, WebP)</p>
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="upload-actions">
        {preview && !uploadedFilename && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload to GridFS'}
          </button>
        )}
        {preview && (
          <button
            onClick={handleReset}
            className="reset-button"
          >
            Reset
          </button>
        )}
      </div>

      <div className="upload-info">
        <p className="info-text">
          <strong>How it works:</strong>
        </p>
        <ul className="info-list">
          <li>Images are stored in <strong>MongoDB GridFS</strong>, not on local disk</li>
          <li>Each image gets a unique filename stored in the database</li>
          <li>Images are served via <code>/api/images/:filename</code></li>
          <li>Use the filename in your event document to reference the image</li>
        </ul>
      </div>
    </div>
  )
}

export default ImageUploadSection

