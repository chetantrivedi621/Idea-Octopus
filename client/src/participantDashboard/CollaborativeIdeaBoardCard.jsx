import './CollaborativeIdeaBoardCard.css'

function CollaborativeIdeaBoardCard() {
  return (
    <div className="collaborative-board-card">
      <div className="board-card-left">
        <div className="board-icon">📁⚡</div>
        <div className="board-content">
          <h2 className="board-title">Collaborative Idea Board</h2>
          <p className="board-description">
            Jump into the live whiteboard where your team can brainstorm together. 
            Drag sticky notes, vote on ideas, and collaborate in real-time with your teammates!
          </p>
          <div className="board-stats">
            <span>3 teammates online</span>
            <span>•</span>
            <span>12 active ideas</span>
            <span>•</span>
            <span>Last updated 2 min ago</span>
          </div>
        </div>
      </div>
      <div className="board-card-right">
        <button className="open-board-button">
          <span>📅</span>
          Open Board
        </button>
      </div>
    </div>
  )
}

export default CollaborativeIdeaBoardCard

