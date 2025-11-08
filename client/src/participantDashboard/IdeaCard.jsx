import './IdeaCard.css'

function IdeaCard({ title, category, hearts, fires, stars, votes }) {
  return (
    <div className="idea-card">
      <div className="idea-card-header">
        <h3 className="idea-title">{title}</h3>
        <span className="idea-category">{category}</span>
      </div>
      <div className="idea-engagement">
        {hearts > 0 && (
          <div className="engagement-item">
            <span className="engagement-icon">❤️</span>
            <span className="engagement-count">{hearts}</span>
          </div>
        )}
        {fires > 0 && (
          <div className="engagement-item">
            <span className="engagement-icon">🔥</span>
            <span className="engagement-count">{fires}</span>
          </div>
        )}
        {stars > 0 && (
          <div className="engagement-item">
            <span className="engagement-icon">⭐</span>
            <span className="engagement-count">{stars}</span>
          </div>
        )}
      </div>
      <div className="idea-footer">
        <span className="vote-count">{votes} votes</span>
        <button className="vote-button">Vote</button>
      </div>
    </div>
  )
}

export default IdeaCard

