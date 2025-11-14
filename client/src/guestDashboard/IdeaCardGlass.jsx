import React from 'react'
import './IdeaCardGlass.css'

function IdeaCardGlass({ ideas = [] }) {
  // Limit to 5 ideas for the glassmorphic cards
  const displayIdeas = ideas.slice(0, 5)

  // Rotation values for each card
  const rotations = [-20, -10, 0, 10, 20]

  if (displayIdeas.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No ideas to display</div>
  }

  return (
    <div className="glass-container">
      {displayIdeas.map((idea, index) => (
        <div
          key={idea.id || index}
          data-text={idea.title}
          style={{ '--r': rotations[index] || 0 }}
          className="glass"
        >
          <div className="glass-content">
            <div className="glass-theme">
              {idea.category || 'General'}
            </div>
            <div className="glass-description">
              {idea.description || 'An innovative idea that could change the world.'}
            </div>
          </div>
          <div className="glass-votes">
            💖 {idea.votes || 0}
          </div>
        </div>
      ))}
    </div>
  )
}

export default IdeaCardGlass

