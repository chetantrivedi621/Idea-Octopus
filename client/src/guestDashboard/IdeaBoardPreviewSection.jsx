import IdeaCardGlass from './IdeaCardGlass'
import './IdeaBoardPreviewSection.css'

function IdeaBoardPreviewSection() {
  const ideas = [
    {
      id: 1,
      title: 'AI Health Monitor',
      category: 'HealthTech',
      description: 'AI-powered health monitoring system that tracks vital signs and provides real-time health insights.',
      votes: 12,
      isSpecial: false
    },
    {
      id: 2,
      title: 'Food Waste Tracker',
      category: 'Sustainability',
      description: 'Smart app that helps reduce food waste by tracking expiration dates and suggesting recipes.',
      votes: 8,
      isSpecial: false
    },
    {
      id: 3,
      title: 'Pet Mood Detector',
      category: 'Funny Ideas',
      description: 'Fun app that uses AI to detect your pet\'s mood and suggest activities to keep them happy.',
      votes: 15,
      isSpecial: false
    },
    {
      id: 4,
      title: 'Dream Journal AI',
      category: 'AI',
      description: 'AI-powered dream journal that analyzes your dreams and provides insights into your subconscious.',
      votes: 10,
      isSpecial: false
    },
    {
      id: 5,
      title: 'Virtual Study Buddy',
      category: 'EdTech',
      description: 'Interactive AI tutor that adapts to your learning style and helps you study more effectively.',
      votes: 6,
      isSpecial: false
    },
    {
      id: 6,
      title: 'Meme Generator Pro',
      category: 'Funny Ideas',
      description: 'Advanced meme generator with AI-powered templates and automatic caption suggestions.',
      votes: 20,
      isSpecial: false
    }
  ]

  return (
    <section className="idea-board">
      <h2 className="idea-title">Idea Board</h2>
      <IdeaCardGlass ideas={ideas} />
    </section>
  )
}

export default IdeaBoardPreviewSection

