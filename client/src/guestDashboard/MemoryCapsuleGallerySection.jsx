import { useState } from 'react'
import CapsuleCard from './CapsuleCard'
import CapsuleDetailsModal from '../components/CapsuleDetailsModal'
import './MemoryCapsuleGallerySection.css'

function MemoryCapsuleGallerySection() {
  const [selectedEvent, setSelectedEvent] = useState(null)

  const events = [
    {
      id: 'spring-hack-2024',
      name: 'Spring Hack 2024',
      ideasPreserved: 24,
      date: 'Mar 2024',
      winners: [
        { 
          name: 'Aman Verma', 
          gmail: 'aman@gmail.com', 
          linkedin: 'https://linkedin.com/in/aman' 
        },
        { 
          name: 'Simran Kaur', 
          gmail: 'simran@gmail.com', 
          linkedin: 'https://linkedin.com/in/simran' 
        },
        { 
          name: 'Dev Rawat', 
          gmail: 'dev@gmail.com', 
          linkedin: 'https://linkedin.com/in/dev' 
        }
      ],
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
      ideasPreserved: 18,
      date: 'Jan 2024',
      winners: [
        { 
          name: 'Priya Sharma', 
          gmail: 'priya@gmail.com', 
          linkedin: 'https://linkedin.com/in/priya' 
        },
        { 
          name: 'Rahul Singh', 
          gmail: 'rahul@gmail.com', 
          linkedin: 'https://linkedin.com/in/rahul' 
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
            onClick={() => setSelectedEvent(event)}
            className="capsule-card-clickable"
          >
            <CapsuleCard
              title={event.name}
              ideasCount={event.ideasPreserved}
              date={event.date}
            />
          </div>
        ))}
      </div>

      {selectedEvent && (
        <CapsuleDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </section>
  )
}

export default MemoryCapsuleGallerySection

