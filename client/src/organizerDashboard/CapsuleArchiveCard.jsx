import './CapsuleArchiveCard.css'

function CapsuleArchiveCard({ title, ideasCount }) {
  return (
    <div className="capsule-archive-card">
      <div className="capsule-content">
        <h3 className="capsule-title">{title}</h3>
        <p className="capsule-ideas">{ideasCount} ideas</p>
      </div>
      <div className="capsule-actions">
        <button className="view-button">View</button>
        <button className="delete-button">Delete</button>
      </div>
    </div>
  )
}

export default CapsuleArchiveCard

