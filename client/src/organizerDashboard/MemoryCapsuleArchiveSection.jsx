import CapsuleArchiveCard from './CapsuleArchiveCard'
import './MemoryCapsuleArchiveSection.css'

function MemoryCapsuleArchiveSection() {
  const capsules = [
    {
      id: 1,
      title: 'Spring Hack 2024',
      ideasCount: 24
    },
    {
      id: 2,
      title: 'AI Innovation Week',
      ideasCount: 18
    },
    {
      id: 3,
      title: 'Green Tech Challenge',
      ideasCount: 15
    }
  ]

  return (
    <section className="memory-capsule-archive-section">
      <h2 className="section-title">Memory Capsule Archive</h2>
      <div className="capsules-grid">
        {capsules.map((capsule) => (
          <CapsuleArchiveCard
            key={capsule.id}
            title={capsule.title}
            ideasCount={capsule.ideasCount}
          />
        ))}
      </div>
    </section>
  )
}

export default MemoryCapsuleArchiveSection

