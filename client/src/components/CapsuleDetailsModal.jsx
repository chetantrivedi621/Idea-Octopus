import './CapsuleDetailsModal.css'

function CapsuleDetailsModal({ event, onClose }) {
  if (!event) return null

  return (
    <div className="capsule-modal-overlay" onClick={onClose}>
      <div className="capsule-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="capsule-modal-close" onClick={onClose}>✖</button>
        
        <div className="capsule-modal-header">
          <h2 className="capsule-modal-title">{event.name}</h2>
          <div className="capsule-modal-meta">
            <p className="capsule-meta-item">📅 {event.date}</p>
            <p className="capsule-meta-item">💡 {event.ideasPreserved || event.ideasCount} ideas preserved</p>
          </div>
        </div>

        <div className="capsule-modal-section">
          <h3 className="capsule-section-title">🏆 Winners</h3>
          {(!event.winners || event.winners.length === 0) ? (
            <p className="capsule-empty-state">No winners added yet.</p>
          ) : (
            <div className="winners-list">
              {event.winners.map((winner, index) => (
                <div key={index} className="winner-card">
                  <div className="winner-rank">#{index + 1}</div>
                  <div className="winner-info">
                    <h4 className="winner-name">{winner.name}</h4>
                    <div className="winner-contacts">
                      <a href={`mailto:${winner.gmail}`} className="winner-link">
                        📧 {winner.gmail}
                      </a>
                      <a 
                        href={winner.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="winner-link"
                      >
                        💼 LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="capsule-modal-section">
          <h3 className="capsule-section-title">📸 Event Memories</h3>
          {(!event.memories || event.memories.length === 0) ? (
            <p className="capsule-empty-state">No memories uploaded.</p>
          ) : (
            <div className="memories-grid">
              {event.memories.map((img, index) => (
                <div key={index} className="memory-image-wrapper">
                  <img 
                    src={img} 
                    alt={`Memory ${index + 1}`}
                    className="memory-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CapsuleDetailsModal

