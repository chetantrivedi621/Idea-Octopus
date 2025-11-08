import { useRef, useState } from 'react'
import CardNav from '../components/CardNav'
import logo from '../assets/react.svg'
import OrganizerPanelTitle from './OrganizerPanelTitle'
import EventOverviewSection from './EventOverviewSection'
import JudgeAccessPanelSection from './JudgeAccessPanelSection'
import MemoryCapsuleArchiveSection from './MemoryCapsuleArchiveSection'
import SharedAnnouncementBoard from '../components/SharedAnnouncementBoard'
import AnnouncementModal from '../components/AnnouncementModal'
import EventModal from '../components/EventModal'
import ExportEventSummaryButton from './ExportEventSummaryButton'
import SharedLeaderboard from '../components/SharedLeaderboard'
import CurrentRoundDisplay from '../components/CurrentRoundDisplay'
import TimelineManagementSection from './TimelineManagementSection'
import './OrganizerDashboard.css'

function OrganizerDashboard({ onRoleChange, teamScores, getTotalScore, announcements, onAddAnnouncement, rounds, currentRound, onUpdateRound, onSetCurrentRound, onCreateEvent, currentRole = 'Organizer' }) {
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const dashboardRef = useRef(null)
  const participantsRef = useRef(null)
  const allIdeasRef = useRef(null)
  const capsulesRef = useRef(null)
  const judgesRef = useRef(null)
  const settingsRef = useRef(null)
  const contentRef = useRef(null)
  const [navHeight, setNavHeight] = useState(60)

  const scrollToSection = (ref) => {
    if (ref && ref.current && contentRef.current) {
      const container = contentRef.current
      const element = ref.current
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const scrollTop = container.scrollTop
      const offsetTop = elementRect.top - containerRect.top + scrollTop - 20
      
      container.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  const leaderboardRef = useRef(null)

  const handleCreateEvent = async (eventData) => {
    try {
      await onCreateEvent(eventData)
      setIsEventModalOpen(false)
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event. Please try again.')
    }
  }

  const navItems = [
    {
      label: "Dashboard",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Home", ariaLabel: "Go to dashboard", onClick: () => scrollToSection(dashboardRef) },
        { label: "Participants", ariaLabel: "View participants", onClick: () => scrollToSection(participantsRef) },
        { label: "Ideas", ariaLabel: "View all ideas", onClick: () => scrollToSection(allIdeasRef) }
      ]
    },
    {
      label: "Content",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Capsules", ariaLabel: "View capsules", onClick: () => scrollToSection(capsulesRef) },
        { label: "Leaderboard", ariaLabel: "View leaderboard", onClick: () => scrollToSection(leaderboardRef) },
        { label: "Judges", ariaLabel: "View judges", onClick: () => scrollToSection(judgesRef) }
      ]
    },
    {
      label: "Settings",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Announcements", ariaLabel: "View announcements", onClick: () => scrollToSection(settingsRef) }
      ]
    }
  ]

  return (
    <div className="organizer-dashboard" style={{ position: 'relative', minHeight: '100vh' }}>
      <CardNav
        logo={logo}
        logoAlt="Company Logo"
        logoText="Hack Capsule"
        items={navItems}
        baseColor="#fff"
        menuColor="#000"
        buttonBgColor="#111"
        buttonTextColor="#fff"
        ease="power3.out"
        onHeightChange={setNavHeight}
        onRoleChange={onRoleChange}
        currentRole={currentRole}
      />
      <div 
        ref={contentRef} 
        className="dashboard-content"
        style={{ 
          paddingTop: `${navHeight + 20}px`,
          transition: 'padding-top 0.4s ease'
        }}
      >
        <main className="main-content">
          <div ref={dashboardRef}>
            <OrganizerPanelTitle />
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="new-event-button"
                onClick={() => setIsEventModalOpen(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
              >
                + Create Event Announcement
              </button>
            </div>
            <CurrentRoundDisplay currentRound={currentRound} />
            <TimelineManagementSection 
              rounds={rounds}
              currentRound={currentRound}
              onUpdateRound={onUpdateRound}
              onSetCurrentRound={onSetCurrentRound}
            />
            <EventOverviewSection />
          </div>
          <div ref={participantsRef}>
            <EventOverviewSection />
          </div>
          <div ref={allIdeasRef}>
            <EventOverviewSection />
          </div>
          <div ref={capsulesRef}>
            <MemoryCapsuleArchiveSection />
          </div>
          <div ref={leaderboardRef}>
            <SharedLeaderboard teamScores={teamScores} getTotalScore={getTotalScore} />
          </div>
          <div ref={judgesRef}>
            <JudgeAccessPanelSection />
          </div>
          <div ref={settingsRef}>
            <SharedAnnouncementBoard 
              announcements={announcements}
              onAddAnnouncement={() => setIsAnnouncementModalOpen(true)}
              canEdit={true}
            />
            <ExportEventSummaryButton />
          </div>
        </main>
      </div>
      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSave={onAddAnnouncement}
      />
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleCreateEvent}
      />
    </div>
  )
}

export default OrganizerDashboard

