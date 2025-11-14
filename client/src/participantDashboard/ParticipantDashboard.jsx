import { useRef, useState, useEffect } from 'react'
import CardNav from '../components/CardNav'
import logo from '../assets/react.svg'
import WelcomeSection from './WelcomeSection'
import CollaborativeIdeaBoardCard from './CollaborativeIdeaBoardCard'
import PPTUploadSection from './PPTUploadSection'
import MemoryCapsulesSection from './MemoryCapsulesSection'
import SharedLeaderboard from '../components/SharedLeaderboard'
import SharedAnnouncementBoard from '../components/SharedAnnouncementBoard'
import CurrentRoundDisplay from '../components/CurrentRoundDisplay'
import UpcomingEventsSection from '../guestDashboard/UpcomingEventsSection'
import { useSocket } from '../hooks/useSocket'
import './ParticipantDashboard.css'

function TeamDashboard({ onRoleChange, teamScores, getTotalScore, announcements, ideas, onAddIdea, teamPPTs, onUploadPPT, currentRound, events = [], currentRole = 'Participant', onFetchParticipantEvents }) {
  // Get team information from localStorage
  const teamInfo = JSON.parse(localStorage.getItem('team') || 'null')
  const teamId = teamInfo?._id || localStorage.getItem('teamId')
  const [participantEvents, setParticipantEvents] = useState([])
  
  // Initialize Socket.io connection
  const { 
    isConnected, 
    activeMembers, 
    socket,
    emitIdeaCreate,
    emitIdeaUpdate,
    emitIdeaReact,
    emitPPTUploaded
  } = useSocket(teamId)

  // Listen for real-time idea updates
  useEffect(() => {
    if (!socket) return

    const handleIdeaCreated = (data) => {
      console.log('Idea created in real-time:', data)
      // Trigger parent to refresh ideas
      if (onAddIdea && data.idea) {
        // You might need to adapt this based on your data structure
        onAddIdea(teamId, data.idea)
      }
    }

    const handleIdeaUpdated = (data) => {
      console.log('Idea updated in real-time:', data)
      // Handle real-time idea updates
    }

    const handleIdeaReacted = (data) => {
      console.log('Idea reacted in real-time:', data)
      // Handle real-time reactions
    }

    const handlePPTUploaded = (data) => {
      console.log('PPT uploaded in real-time:', data)
      // Handle real-time PPT upload notifications
    }

    socket.on('idea:created', handleIdeaCreated)
    socket.on('idea:updated', handleIdeaUpdated)
    socket.on('idea:reacted', handleIdeaReacted)
    socket.on('ppt:uploaded-notification', handlePPTUploaded)

    return () => {
      socket.off('idea:created', handleIdeaCreated)
      socket.off('idea:updated', handleIdeaUpdated)
      socket.off('idea:reacted', handleIdeaReacted)
      socket.off('ppt:uploaded-notification', handlePPTUploaded)
    }
  }, [socket, teamId, onAddIdea])

  // Fetch participant events (events they participated in with memory capsules)
  useEffect(() => {
    if (teamId && onFetchParticipantEvents) {
      const fetchEvents = async () => {
        const events = await onFetchParticipantEvents(teamId)
        setParticipantEvents(events)
      }
      fetchEvents()
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchEvents, 30000)
      return () => clearInterval(interval)
    }
  }, [teamId, onFetchParticipantEvents])

  const dashboardRef = useRef(null)
  const eventsRef = useRef(null)
  const collaborativeBoardRef = useRef(null)
  const capsulesRef = useRef(null)
  const leaderboardRef = useRef(null)
  const announcementsRef = useRef(null)
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

  const navItems = [
    {
      label: "Dashboard",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Home", ariaLabel: "Go to dashboard", onClick: () => scrollToSection(dashboardRef) },
        { label: "Events", ariaLabel: "View upcoming events", onClick: () => scrollToSection(eventsRef) }
      ]
    },
    {
      label: "Content",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Collaborative Board", ariaLabel: "View collaborative idea board", onClick: () => scrollToSection(collaborativeBoardRef) },
        { label: "Announcements", ariaLabel: "View announcements", onClick: () => scrollToSection(announcementsRef) }
      ]
    },
    {
      label: "Competition",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Leaderboard", ariaLabel: "View leaderboard", onClick: () => scrollToSection(leaderboardRef) },
        { label: "Capsules", ariaLabel: "View capsules", onClick: () => scrollToSection(capsulesRef) }
      ]
    }
  ]

  // Get team name from teamInfo or fallback
  const teamName = teamInfo?.name || 'Your Team'

  return (
    <div className="participant-dashboard" style={{ position: 'relative', minHeight: '100vh' }}>
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
        {/* Real-time connection status */}
        {teamId && (
          <div className="realtime-status" style={{
            position: 'fixed',
            top: `${navHeight + 10}px`,
            right: '20px',
            zIndex: 1000,
            background: isConnected ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? '#4caf50' : '#f44336',
              animation: isConnected ? 'pulse 2s infinite' : 'none'
            }}></span>
            {isConnected ? `${activeMembers.length} teammates online` : 'Disconnected'}
          </div>
        )}
        <main className="main-content">
          <div ref={dashboardRef}>
            <WelcomeSection />
            <div style={{ marginBottom: '40px' }}>
              <CurrentRoundDisplay currentRound={currentRound} />
            </div>
            <div ref={announcementsRef} style={{ marginTop: '40px' }}>
              <SharedAnnouncementBoard 
                announcements={announcements}
                canEdit={false}
              />
            </div>
            <div ref={collaborativeBoardRef} style={{ marginTop: '60px' }}>
              <CollaborativeIdeaBoardCard />
            </div>
          </div>
          <div ref={eventsRef}>
            <UpcomingEventsSection events={events} />
          </div>
          <div>
            <PPTUploadSection 
              teamPPT={teamPPTs[1]} 
              onUploadPPT={onUploadPPT}
              teamName={teamName}
            />
          </div>
          <div ref={leaderboardRef}>
            <SharedLeaderboard teamScores={teamScores} getTotalScore={getTotalScore} />
          </div>
          <div ref={capsulesRef}>
            <MemoryCapsulesSection participantEvents={participantEvents} />
          </div>
        </main>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default TeamDashboard

