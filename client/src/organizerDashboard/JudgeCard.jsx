import './JudgeCard.css'

function JudgeCard({ name, email, status }) {
  return (
    <div className="judge-card">
      <div className="judge-info">
        <div className="judge-name">{name}</div>
        <div className="judge-email">{email}</div>
      </div>
      <div className="judge-actions">
        <span className={`judge-status ${status.toLowerCase()}`}>{status}</span>
        <button className="delete-button" aria-label="Delete judge">
          🗑️
        </button>
      </div>
    </div>
  )
}

export default JudgeCard

