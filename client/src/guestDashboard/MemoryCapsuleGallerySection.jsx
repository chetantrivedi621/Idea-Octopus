import CapsuleCard from './CapsuleCard'
import './MemoryCapsuleGallerySection.css'

function MemoryCapsuleGallerySection() {
  const capsules = [
    {
      id: 1,
      title: 'Spring Hack 2024',
      ideasCount: 24,
      date: 'Mar 2024'
    },
    {
      id: 2,
      title: 'AI Innovation Week',
      ideasCount: 18,
      date: 'Jan 2024'
    },
    {
      id: 3,
      title: 'Green Tech Challenge',
      ideasCount: 15,
      date: 'Dec 2023'
    }
  ]

  return (
    <section className="memory-capsule-gallery-section">
      <h2 className="section-title">
        <span className="section-icon">📦</span>
        Memory Capsule Gallery
      </h2>
      <div className="capsules-grid">
        {capsules.map((capsule) => (
          <CapsuleCard
            key={capsule.id}
            title={capsule.title}
            ideasCount={capsule.ideasCount}
            date={capsule.date}
          />
        ))}
      </div>
    </section>
  )
}

export default MemoryCapsuleGallerySection

