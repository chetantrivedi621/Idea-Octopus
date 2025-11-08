import { useRef, useState } from 'react'
import CardNav from '../components/CardNav'
import logo from '../assets/react.svg'
import WelcomeSection from './WelcomeSection'
import CollaborativeIdeaBoardCard from './CollaborativeIdeaBoardCard'
import PPTUploadSection from './PPTUploadSection'
import YourIdeasBoardSection from './YourIdeasBoardSection'
import MemoryCapsulesSection from './MemoryCapsulesSection'
import SharedLeaderboard from '../components/SharedLeaderboard'
import SharedAnnouncementBoard from '../components/SharedAnnouncementBoard'
import CurrentRoundDisplay from '../components/CurrentRoundDisplay'
import './ParticipantDashboard.css'

function ParticipantDashboard({ onRoleChange, teamScores, getTotalScore, announcements, ideas, onAddIdea, teamPPTs, onUploadPPT, currentRound, currentRole = 'Participant' }) {
  const dashboardRef = useRef(null)
  const myIdeasRef = useRef(null)
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
        { label: "My Ideas", ariaLabel: "View my ideas", onClick: () => scrollToSection(myIdeasRef) }
      ]
    },
    {
      label: "Content",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Capsules", ariaLabel: "View capsules", onClick: () => scrollToSection(capsulesRef) },
        { label: "Announcements", ariaLabel: "View announcements", onClick: () => scrollToSection(announcementsRef) }
      ]
    },
    {
      label: "Competition",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Leaderboard", ariaLabel: "View leaderboard", onClick: () => scrollToSection(leaderboardRef) }
      ]
    }
  ]

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
        <main className="main-content">
          <div ref={dashboardRef}>
            <WelcomeSection />
            <CurrentRoundDisplay currentRound={currentRound} />
            <PPTUploadSection 
              teamPPT={teamPPTs[1]} 
              onUploadPPT={onUploadPPT}
            />
            <CollaborativeIdeaBoardCard />
          </div>
          <div ref={myIdeasRef}>
            <YourIdeasBoardSection ideas={ideas} onAddIdea={onAddIdea} />
          </div>
          <div ref={capsulesRef}>
            <MemoryCapsulesSection />
          </div>
          <div ref={announcementsRef}>
            <SharedAnnouncementBoard 
              announcements={announcements}
              canEdit={false}
            />
          </div>
          <div ref={leaderboardRef}>
            <SharedLeaderboard teamScores={teamScores} getTotalScore={getTotalScore} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default ParticipantDashboard

