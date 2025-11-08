import IdeaCard from './IdeaCard'
import './IdeaBoardPreviewSection.css'

function IdeaBoardPreviewSection() {
  const ideas = [
    {
      id: 1,
      title: 'AI Health Monitor',
      category: 'HealthTech',
      votes: 12,
      isSpecial: false
    },
    {
      id: 2,
      title: 'Food Waste Tracker',
      category: 'Sustainability',
      votes: 8,
      isSpecial: true
    },
    {
      id: 3,
      title: 'Pet Mood Detector',
      category: 'Funny Ideas',
      votes: 15,
      isSpecial: false
    },
    {
      id: 4,
      title: 'Dream Journal AI',
      category: 'AI',
      votes: 10,
      isSpecial: false
    },
    {
      id: 5,
      title: 'Virtual Study Buddy',
      category: 'EdTech',
      votes: 6,
      isSpecial: false
    },
    {
      id: 6,
      title: 'Meme Generator Pro',
      category: 'Funny Ideas',
      votes: 20,
      isSpecial: false
    }
  ]

  return (
    <section className="idea-board">
      <h2 className="idea-title">Idea Board Preview</h2>
      <div className="idea-grid">
        {ideas.map((idea, index) => (
          <IdeaCard
            key={idea.id}
            title={idea.title}
            category={idea.category}
            votes={idea.votes}
            isSpecial={idea.isSpecial}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}

export default IdeaBoardPreviewSection

