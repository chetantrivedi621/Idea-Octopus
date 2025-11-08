import { useRef, useState } from 'react'
import CardNav from '../components/CardNav'
import logo from '../assets/react.svg'
import JudgeDashboardTitle from './JudgeDashboardTitle'
import TeamsPanelSection from './TeamsPanelSection'
import LeaderboardSection from './LeaderboardSection'
import AISummarySection from './AISummarySection'
import CurrentRoundDisplay from '../components/CurrentRoundDisplay'
import './JudgeDashboard.css'

function JudgeDashboard({ onRoleChange, teamScores, onSaveMarks, getTotalScore, teamPPTs, currentRound, currentRole = 'Judge' }) {
  const dashboardRef = useRef(null)
  const teamsRef = useRef(null)
  const leaderboardRef = useRef(null)
  const profileRef = useRef(null)
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
        { label: "Teams", ariaLabel: "View teams", onClick: () => scrollToSection(teamsRef) }
      ]
    },
    {
      label: "Results",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Leaderboard", ariaLabel: "View leaderboard", onClick: () => scrollToSection(leaderboardRef) },
        { label: "AI Summary", ariaLabel: "View AI summary", onClick: () => scrollToSection(profileRef) }
      ]
    }
  ]

  return (
    <div className="judge-dashboard" style={{ position: 'relative', minHeight: '100vh' }}>
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
            <JudgeDashboardTitle />
            <CurrentRoundDisplay currentRound={currentRound} />
          </div>
          <div ref={teamsRef}>
            <TeamsPanelSection 
              teamScores={teamScores} 
              onSaveMarks={onSaveMarks}
              getTotalScore={getTotalScore}
              teamPPTs={teamPPTs}
            />
          </div>
          <div ref={leaderboardRef}>
            <LeaderboardSection 
              teamScores={teamScores}
              getTotalScore={getTotalScore}
            />
          </div>
          <div ref={profileRef}>
            <AISummarySection />
          </div>
        </main>
      </div>
    </div>
  )
}

export default JudgeDashboard

