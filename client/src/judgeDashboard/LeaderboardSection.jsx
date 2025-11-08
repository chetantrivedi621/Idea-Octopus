import SharedLeaderboard from '../components/SharedLeaderboard'
import './LeaderboardSection.css'

function LeaderboardSection({ teamScores, getTotalScore }) {
  return <SharedLeaderboard teamScores={teamScores} getTotalScore={getTotalScore} />
}

export default LeaderboardSection

