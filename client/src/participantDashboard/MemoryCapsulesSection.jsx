import CapsuleCard from './CapsuleCard'
import './MemoryCapsulesSection.css'

function MemoryCapsulesSection() {
  const capsules = [
    {
      id: 1,
      title: 'Midnight Snack Finder',
      isUnlocked: true,
      votes: 12
    },
    {
      id: 2,
      title: 'Smart Campus Navigator',
      isUnlocked: false,
      votesNeeded: 3
    }
  ]

  return (
    <section className="memory-capsules-section">
      <h2 className="section-title">
        <span className="section-icon">💊</span>
        Memory Capsules
      </h2>
      <div className="capsules-grid">
        {capsules.map((capsule) => (
          <CapsuleCard
            key={capsule.id}
            title={capsule.title}
            isUnlocked={capsule.isUnlocked}
            votes={capsule.votes}
            votesNeeded={capsule.votesNeeded}
          />
        ))}
      </div>
    </section>
  )
}

export default MemoryCapsulesSection

