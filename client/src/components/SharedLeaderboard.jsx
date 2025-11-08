import { useMemo } from 'react'
import './SharedLeaderboard.css'

function SharedLeaderboard({ teamScores, getTotalScore }) {
  const teams = [
    { id: 1, name: 'Team Innovators', project: 'AI Study Assistant', maxScore: 30 },
    { id: 2, name: 'Code Wizards', project: 'Green Energy Tracker', maxScore: 30 },
    { id: 3, name: 'Team Code Black', project: 'Midnight Snack Finder', maxScore: 30 },
    { id: 4, name: 'Byte Squad', project: 'Virtual Pet Therapist', maxScore: 30 },
    { id: 5, name: 'Hack Titans', project: 'Dream Analyzer', maxScore: 30 }
  ]

  // Get rank colors based on position
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#ffd700' // Gold
      case 2: return '#c0c0c0' // Silver
      case 3: return '#cd7f32' // Bronze
      default: return '#2196f3' // Blue
    }
  }

  // Sort teams by score (descending) - higher scores first
  // If scores are equal, maintain original order
  const sortedTeams = useMemo(() => {
    return [...teams]
      .map(team => ({
        ...team,
        score: getTotalScore(teamScores[team.id]) || 0
      }))
      .sort((a, b) => {
        // Primary sort: by score (descending)
        if (b.score !== a.score) {
          return b.score - a.score
        }
        // Secondary sort: by team ID (ascending) for consistent ordering when scores are equal
        return a.id - b.id
      })
      .map((team, index) => ({
        ...team,
        rank: index + 1,
        rankColor: getRankColor(index + 1)
      }))
  }, [teamScores, getTotalScore, teams])

  return (
    <section className="shared-leaderboard-section">
      <h2 className="section-title">
        <span className="section-icon">🏆</span>
        Leaderboard
      </h2>
      <div className="leaderboard-list">
        {sortedTeams.map((team) => {
          const score = team.score
          const hasScore = score > 0
          
          return (
            <div 
              key={team.id} 
              className={`leaderboard-row ${hasScore ? 'has-score' : 'no-score'}`}
              style={{
                order: team.rank
              }}
            >
              <div 
                className="rank-circle" 
                style={{ backgroundColor: team.rankColor }}
              >
                {team.rank}
              </div>
              <div className="team-info">
                <div className="team-name">{team.name}</div>
                <div className="team-project">{team.project}</div>
              </div>
              <div className="team-score">
                <span className={`score-value ${hasScore ? 'scored' : 'not-scored'}`}>
                  {score} / {team.maxScore}
                </span>
                <span className="score-label">points</span>
                {hasScore && (
                  <div className="score-percentage">
                    {Math.round((score / team.maxScore) * 100)}%
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default SharedLeaderboard

