import TeamCard from './TeamCard'
import './TeamsPanelSection.css'

function TeamsPanelSection({ teamScores, onSaveMarks, getTotalScore, teamPPTs }) {
  const teams = [
    {
      id: 1,
      name: 'Team Innovators',
      description: 'AI Study Assistant',
      category: 'EdTech'
    },
    {
      id: 2,
      name: 'Code Wizards',
      description: 'Green Energy Tracker',
      category: 'Sustainability'
    },
    {
      id: 3,
      name: 'Team Code Black',
      description: 'Midnight Snack Finder',
      category: 'Funny Ideas'
    },
    {
      id: 4,
      name: 'Byte Squad',
      description: 'Virtual Pet Therapist',
      category: 'HealthTech'
    },
    {
      id: 5,
      name: 'Hack Titans',
      description: 'Dream Analyzer',
      category: 'AI'
    }
  ]

  return (
    <section className="teams-panel-section">
      <h2 className="section-title">
        <span className="section-icon">👥</span>
        Teams Panel
      </h2>
      <div className="teams-grid">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            currentScores={teamScores[team.id]}
            onSaveMarks={onSaveMarks}
            getTotalScore={getTotalScore}
            teamPPT={teamPPTs[team.id]}
          />
        ))}
      </div>
    </section>
  )
}

export default TeamsPanelSection

