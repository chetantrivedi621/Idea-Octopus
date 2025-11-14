import './IdeaCard.css'

function IdeaCard({ title, category, votes, isSpecial, index = 0 }) {
  // Determine tag color based on category
  const getTagClass = () => {
    if (isSpecial) return 'pink'
    if (category === 'HealthTech') return 'green'
    if (category === 'Sustainability') return 'pink'
    if (category === 'Funny Ideas') return 'light-green'
    if (category === 'AI') return 'green'
    if (category === 'EdTech') return 'light-green'
    return 'green' // Default fallback
  }

  return (
    <div 
      className={`idea-card ${isSpecial ? 'featured' : ''}`}
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className="card-header">
        <h3>{title}</h3>
        {category && (
          <span className={`tag ${getTagClass()}`}>{category}</span>
        )}
      </div>
      <div className="card-footer">
        <span className="votes">💖 {votes} votes</span>
      </div>
    </div>
  )
}

export default IdeaCard

