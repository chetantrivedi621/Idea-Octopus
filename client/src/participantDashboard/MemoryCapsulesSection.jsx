import { useState } from 'react'
import CapsuleCard from '../guestDashboard/CapsuleCard'
import SpotlightCard from '../components/SpotlightCard'
import CapsuleDetailsModal from '../components/CapsuleDetailsModal'
import './MemoryCapsulesSection.css'

function MemoryCapsulesSection({ participantEvents = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Format event for display
  const formatEventForDisplay = (event) => {
    if (!event) return null
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Date TBD'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    }

    return {
      id: event._id || event.id,
      name: event.name || 'Untitled Event',
      ideasPreserved: 0, // This could be calculated from ideas count
      date: formatDate(event.startDate),
      winners: event.winners || [],
      tags: event.tags || [],
      memories: event.memories || [],
      gallery: event.gallery || []
    }
  }

  const formattedEvents = participantEvents
    .map(event => formatEventForDisplay(event))
    .filter(event => event !== null)

  return (
    <section className="memory-capsules-section">
      <h2 className="section-title">
        <span className="section-icon">📦</span>
        Memory Capsule Gallery
      </h2>
      {formattedEvents.length > 0 ? (
        <div className="capsules-grid">
          {formattedEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
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
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No memory capsules available yet. Memory capsules will appear here after events you participated in are completed and organizers add winners or photos.</p>
        </div>
      )}

      {selectedEvent && (
        <CapsuleDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </section>
  )
}

export default MemoryCapsulesSection

