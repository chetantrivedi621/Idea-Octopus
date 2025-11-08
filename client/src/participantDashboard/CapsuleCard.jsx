import './CapsuleCard.css'

function CapsuleCard({ title, isUnlocked, votes, votesNeeded }) {
  return (
    <div className={`capsule-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
      <div className="capsule-content">
        <h3 className="capsule-title">{title}</h3>
        <div className="capsule-status">
          {isUnlocked ? (
            <>
              <span className="status-icon">✓</span>
              <span>Unlocked • {votes} votes</span>
            </>
          ) : (
            <span>{votesNeeded} more votes to unlock</span>
          )}
        </div>
      </div>
      {isUnlocked && (
        <button className="view-timeline-button">View Timeline</button>
      )}
    </div>
  )
}

export default CapsuleCard

