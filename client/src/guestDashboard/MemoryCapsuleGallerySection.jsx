import { useNavigate } from 'react-router-dom'
import CapsuleCard from './CapsuleCard'
import SpotlightCard from '../components/SpotlightCard'
import './MemoryCapsuleGallerySection.css'

function MemoryCapsuleGallerySection() {
  const navigate = useNavigate()

  const events = [
    {
      id: 'spring-hack-2024',
      name: 'Spring Hack 2024',
      organizerClub: 'Tech Innovation Club',
      ideasPreserved: 24,
      date: 'Mar 2024',
      winners: [
        {
          position: 1,
          teamName: 'Brainstormers',
          idea: 'AI Health Monitor',
          members: [
            { name: 'Aman Verma', email: 'aman@gmail.com', linkedin: 'https://linkedin.com/in/aman' },
            { name: 'Priya Sharma', email: 'priya@gmail.com', linkedin: 'https://linkedin.com/in/priya' }
          ]
        },
        {
          position: 2,
          teamName: 'Code Wizards',
          idea: 'Food Waste Tracker',
          members: [
            { name: 'Simran Kaur', email: 'simran@gmail.com', linkedin: 'https://linkedin.com/in/simran' },
            { name: 'Rahul Singh', email: 'rahul@gmail.com', linkedin: 'https://linkedin.com/in/rahul' }
          ]
        },
        {
          position: 3,
          teamName: 'Innovation Squad',
          idea: 'Pet Mood Detector',
          members: [
            { name: 'Dev Rawat', email: 'dev@gmail.com', linkedin: 'https://linkedin.com/in/dev' }
          ]
        }
      ],
      tags: ['AI', 'HEALTHTECH', 'FUNNY IDEAS', 'SUSTAINABILITY', 'EDTECH', 'FINTECH'],
      memories: [
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=400&fit=crop'
      ]
    },
    {
      id: 'ai-week-2024',
      name: 'AI Innovation Week',
      organizerClub: 'AI Research Society',
      ideasPreserved: 18,
      date: 'Jan 2024',
      winners: [
        {
          position: 1,
          teamName: 'AI Pioneers',
          idea: 'Dream Journal AI',
          members: [
            { name: 'Priya Sharma', email: 'priya@gmail.com', linkedin: 'https://linkedin.com/in/priya' }
          ]
        },
        {
          position: 2,
          teamName: 'Neural Networks',
          idea: 'Virtual Study Buddy',
          members: [
            { name: 'Rahul Singh', email: 'rahul@gmail.com', linkedin: 'https://linkedin.com/in/rahul' }
          ]
        }
      ],
      memories: [
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop'
      ]
    },
    {
      id: 'green-tech',
      name: 'Green Tech Challenge',
      organizerClub: 'Environmental Club',
      ideasPreserved: 15,
      date: 'Dec 2023',
      winners: [],
      memories: []
    }
  ]

  return (
    <section className="memory-capsule-gallery-section">
      <h2 className="section-title">
        <span className="section-icon">📦</span>
        Memory Capsule Gallery
      </h2>
      <div className="capsules-grid">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => navigate(`/event/${event.id}`)}
            className="capsule-card-clickable"
          >
            <SpotlightCard spotlightColor="rgba(82, 39, 255, 0.15)">
              <CapsuleCard
                title={event.name}
                ideasCount={event.ideasPreserved}
                date={event.date}
              />
            </SpotlightCard>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MemoryCapsuleGallerySection

