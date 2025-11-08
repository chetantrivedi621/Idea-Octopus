import { useState } from 'react'
import './Logo.css'

function Logo() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="logo-container">
      {!imageError ? (
        <img 
          src="/logo.png" 
          alt="HackCapsule Logo" 
          className="logo-image"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="logo-fallback">
          <div className="logo-graphic">
            <div className="logo-icon-left">💡</div>
            <div className="logo-icon-right">💡</div>
          </div>
          <div className="logo-text-container">
            <span className="logo-text-hack">Hack</span>
            <span className="logo-text-cap">Cap</span>
            <span className="logo-text-sule">sule</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Logo

