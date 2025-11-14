import './CapsuleCard.css'

function CapsuleCard({ title, ideasCount, date }) {
  return (
    <div className="capsule-card">
      <div className="capsule-card-bg-shape"></div>
      <div className="capsule-card-content">
        <h3 className="capsule-title">{title}</h3>
        <div className="capsule-details">
          <div className="capsule-detail-item">
            <span className="detail-icon">💡</span>
            <span className="detail-text">{ideasCount} ideas preserved</span>
          </div>
          <div className="capsule-detail-item">
            <span className="detail-icon">📅</span>
            <span className="detail-text">{date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CapsuleCard

