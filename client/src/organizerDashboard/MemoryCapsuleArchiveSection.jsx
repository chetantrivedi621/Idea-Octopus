import { useState } from 'react'
import CapsuleCard from '../guestDashboard/CapsuleCard'
import SpotlightCard from '../components/SpotlightCard'
import CapsuleDetailsModal from '../components/CapsuleDetailsModal'
import WinnerDetailsModal from './WinnerDetailsModal'
import EventPhotosModal from './EventPhotosModal'
import './MemoryCapsuleArchiveSection.css'

function MemoryCapsuleArchiveSection({ currentEvent, onUpdateEvent, completedEvents = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false)
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false)

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

  const displayEvent = formatEventForDisplay(currentEvent)
  
  // Filter completed events that have memory capsules (winners or memories)
  const completedCapsules = completedEvents
    .filter(event => {
      const hasWinners = event.winners && event.winners.length > 0
      const hasMemories = event.memories && event.memories.length > 0
      return hasWinners || hasMemories || event.memoryCapsuleCreated
    })
    .map(event => formatEventForDisplay(event))
    .filter(event => event !== null)

  return (
    <section className="memory-capsule-archive-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="section-title">
          <span className="section-icon">📦</span>
          Memory Capsule Gallery
        </h2>
        {displayEvent && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setIsWinnerModalOpen(true)}
              style={{
                padding: '0.5rem 1rem',
                background: '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              + Add Winners
            </button>
            <button
              onClick={() => setIsPhotosModalOpen(true)}
              style={{
                padding: '0.5rem 1rem',
                background: '#8bc34a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              + Add Photos
            </button>
          </div>
        )}
      </div>
      
      {/* Current Event (if active) */}
      {displayEvent && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
            Current Event
          </h3>
          <div className="capsules-grid">
            <div
              onClick={() => setSelectedEvent(displayEvent)}
              className="capsule-card-clickable"
            >
              <SpotlightCard spotlightColor="rgba(82, 39, 255, 0.15)">
                <CapsuleCard
                  title={displayEvent.name}
                  ideasCount={displayEvent.ideasPreserved}
                  date={displayEvent.date}
                />
              </SpotlightCard>
            </div>
          </div>
        </div>
      )}

      {/* Completed Events with Memory Capsules */}
      {completedCapsules.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
            Completed Events
          </h3>
          <div className="capsules-grid">
            {completedCapsules.map((event) => (
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
        </div>
      )}

      {!displayEvent && completedCapsules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No memory capsules available. Create an event and add winners or photos to build memory capsules.</p>
        </div>
      )}

      {selectedEvent && (
        <CapsuleDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}

      {isWinnerModalOpen && currentEvent && (
        <WinnerDetailsModal
          isOpen={isWinnerModalOpen}
          onClose={() => setIsWinnerModalOpen(false)}
          event={currentEvent}
          onSave={onUpdateEvent}
        />
      )}

      {isPhotosModalOpen && currentEvent && (
        <EventPhotosModal
          isOpen={isPhotosModalOpen}
          onClose={() => setIsPhotosModalOpen(false)}
          event={currentEvent}
          onSave={onUpdateEvent}
        />
      )}
    </section>
  )
}

export default MemoryCapsuleArchiveSection

