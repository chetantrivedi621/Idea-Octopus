import { useEffect, useState } from 'react'
import './WelcomeSection.css'

function WelcomeSection() {
  const [teamName, setTeamName] = useState('Team Code Black')
  
  useEffect(() => {
    // Get team name from localStorage
    const teamInfo = JSON.parse(localStorage.getItem('team') || 'null')
    if (teamInfo?.name) {
      setTeamName(teamInfo.name)
    }
  }, [])

  return (
    <section className="welcome-section">
      <h1 className="welcome-title">
        Welcome back <span className="rocket-emoji">🚀</span>
      </h1>
      <p className="welcome-subtitle">Your ideas, your legacy.</p>
    </section>
  )
}

export default WelcomeSection

