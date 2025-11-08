import './IdeaCard.css'

function IdeaCard({ title, category, votes, isSpecial, index = 0 }) {
  // Determine tag color based on category
  const getTagClass = () => {
    if (isSpecial) return 'pink'
    if (category === 'HealthTech' || category === 'AI' || category === 'EdTech') return 'green'
    return 'green'
  }

  return (
    <div 
      className={`idea-card ${isSpecial ? 'featured' : ''}`}
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className="card-header">
        <h3>{title}</h3>
        <span className={`tag ${getTagClass()}`}>{category}</span>
      </div>
      {isSpecial && (
        <p className="card-desc">Sign up to post your own idea!</p>
      )}
      <div className="card-footer">
        <span className="votes">💖 {votes} votes</span>
      </div>
    </div>
  )
}

export default IdeaCard

