import './LeaderboardSection.css'

function LeaderboardSection() {
  const teams = [
    { rank: 1, name: 'Team Innovators', project: 'AI Study Assistant', score: 28 },
    { rank: 2, name: 'Code Wizards', project: 'Green Energy Tracker', score: 24 },
    { rank: 3, name: 'Team Code Black', project: 'Midnight Snack Finder', score: 12 },
    { rank: 4, name: 'Byte Squad', project: 'Virtual Pet Therapist', score: 10 },
    { rank: 5, name: 'Hack Titans', project: 'Dream Analyzer', score: 9 }
  ]

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#ffd700'
      case 2: return '#9e9e9e'
      case 3: return '#ff9800'
      default: return '#8bc34a'
    }
  }

  return (
    <section className="leaderboard-section">
      <h2 className="section-title">
        <span className="section-icon">🏆</span>
        Leaderboard
      </h2>
      <div className="leaderboard-list">
        {teams.map((team) => (
          <div
            key={team.rank}
            className={`leaderboard-row ${team.name === 'Team Code Black' ? 'highlighted' : ''}`}
          >
            <div className="rank-circle" style={{ backgroundColor: getRankColor(team.rank) }}>
              {team.rank}
            </div>
            <div className="team-info">
              <div className="team-name">{team.name}</div>
              <div className="team-project">{team.project}</div>
            </div>
            <div className="team-score">
              <span className="score-icon">❤️</span>
              <span className="score-value">{team.score}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default LeaderboardSection

