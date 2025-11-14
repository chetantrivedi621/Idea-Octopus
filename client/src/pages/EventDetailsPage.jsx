import { useParams, useNavigate } from 'react-router-dom'
import CircularGallery from '../components/CircularGallery'
import './EventDetailsPage.css'

function EventDetailsPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // Mock event data - in production, fetch from API using eventId
  const events = {
    'spring-hack-2024': {
      id: 'spring-hack-2024',
      name: 'Spring Hack 2024',
      organizerClub: 'Tech Innovation Club',
      date: 'Mar 2024',
      ideasPreserved: 24,
      winners: [
        {
          position: 1,
          teamName: 'Brainstormers',
          idea: 'AI Health Monitor',
          members: [
            { name: 'Aman Verma', email: 'aman@gmail.com', linkedin: 'https://linkedin.com/in/aman' }
          ]
        },
        {
          position: 2,
          teamName: 'Code Wizards',
          idea: 'Food Waste Tracker',
          members: [
            { name: 'Simran Kaur', email: 'simran@gmail.com', linkedin: 'https://linkedin.com/in/simran' }
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
    'ai-week-2024': {
      id: 'ai-week-2024',
      name: 'AI Innovation Week',
      organizerClub: 'AI Research Society',
      date: 'Jan 2024',
      ideasPreserved: 18,
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
    }
  }

  const event = events[eventId]

  if (!event) {
    return (
      <div className="event-details-page">
        <div className="event-not-found">
          <h2>Event Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="event-details-page">
      <button onClick={() => navigate('/dashboard')} className="back-button">
        ← Back to Dashboard
      </button>

      <div className="event-banner">
        <div className="banner-overlay">
          <h1 className="event-title">{event.name}</h1>
        </div>
      </div>

      <div className="event-details-container">
        <div className="event-header">
          <div className="event-meta">
            <div className="meta-item">
              <span className="meta-icon">🏢</span>
              <span className="meta-label">Organizer:</span>
              <span className="meta-value">{event.organizerClub}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span className="meta-value">{event.date}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">💡</span>
              <span className="meta-value">{event.ideasPreserved} ideas preserved</span>
            </div>
          </div>
        </div>

        <div className="event-section">
          <h2 className="section-title">🏆 Top 3 Winners</h2>
          <div className="winners-grid">
            {event.winners && event.winners.length > 0 ? (
              event.winners.map((winner) => (
                <div key={winner.position} className="winner-card-detail">
                  <div className="winner-rank-badge">
                    <span className="rank-text">
                      #{winner.position} {winner.position === 1 ? 'WINNER' : winner.position === 2 ? 'RUNNER-UP' : '2ND RUNNER-UP'}
                    </span>
                  </div>
                  <div className="winner-content">
                    <h3 className="winner-team-name">{winner.teamName}</h3>
                    <div className="winner-idea">
                      <span className="idea-label">Idea:</span>
                      <span className="idea-name">{winner.idea}</span>
                    </div>
                    <div className="winner-members">
                      <h4 className="members-title">Team Members:</h4>
                      {winner.members.map((member, index) => (
                        <div key={index} className="member-card">
                          <div className="member-name">{member.name}</div>
                          <div className="member-contacts">
                            {member.email && (
                              <a href={`mailto:${member.email}`} className="contact-link email">
                                📧 {member.email}
                              </a>
                            )}
                            {member.linkedin && (
                              <a 
                                href={member.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="contact-link linkedin"
                              >
                                💼 LinkedIn Profile
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-winners">No winners added yet.</p>
            )}
          </div>
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="event-section">
            <h2 className="section-title">🏷️ Tags</h2>
            <div className="tags-container">
              {event.tags.map((tag, index) => (
                <span key={index} className="tag-badge">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {event.memories && event.memories.length > 0 && (
          <div className="event-section" style={{ marginBottom: '0' }}>
            <h2 className="section-title">📸 Event Memories</h2>
            <div className="memories-gallery-container">
              <CircularGallery 
                items={event.memories.map((memory, index) => ({
                  image: memory,
                  text: `Memory ${index + 1}`
                }))}
                bend={3}
                textColor="#ffffff"
                borderRadius={0.05}
                scrollEase={0.02}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDetailsPage

