import './CapsuleCard.css'

function CapsuleCard({ title, ideasCount, date }) {
  return (
    <div className="capsule-card">
      <h3 className="capsule-title">{title}</h3>
      <div className="capsule-details">
        <span className="ideas-count">{ideasCount} ideas preserved</span>
        <span className="capsule-date">{date}</span>
      </div>
    </div>
  )
}

export default CapsuleCard

