import { useState, useEffect } from 'react'
import GuestDashboard from './guestDashboard/GuestDashboard'
import ParticipantDashboard from './participantDashboard/ParticipantDashboard'
import OrganizerDashboard from './organizerDashboard/OrganizerDashboard'
import JudgeDashboard from './judgeDashboard/JudgeDashboard'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function App() {
  const [currentRole, setCurrentRole] = useState('Guest')
  const [events, setEvents] = useState([])

  // Shared state for team scores across all dashboards
  const [teamScores, setTeamScores] = useState({
    1: null, // Team Innovators
    2: null, // Code Wizards
    3: null, // Team Code Black
    4: null, // Byte Squad
    5: null  // Hack Titans
  })

  // Shared state for announcements across all dashboards
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      message: 'Welcome to HackCapsule 2024! 👋',
      timeAgo: '2 hours ago',
      timestamp: Date.now() - 2 * 60 * 60 * 1000
    },
    {
      id: 2,
      message: 'Submissions close at 6 PM today',
      timeAgo: '5 hours ago',
      timestamp: Date.now() - 5 * 60 * 60 * 1000
    }
  ])

  // Shared state for ideas across all dashboards (only for participants)
  // Ideas are stored by teamId, each team can have multiple ideas
  const [ideas, setIdeas] = useState({
    1: [], // Team Innovators
    2: [], // Code Wizards
    3: [], // Team Code Black
    4: [], // Byte Squad
    5: []  // Hack Titans
  })

  // Shared state for PPT files across all dashboards
  // PPTs are stored by teamId, each team can upload one PPT
  const [teamPPTs, setTeamPPTs] = useState({
    1: null, // Team Innovators
    2: null, // Code Wizards
    3: null, // Team Code Black
    4: null, // Byte Squad
    5: null  // Hack Titans
  })

  // Shared state for rounds/timeline across all dashboards
  const [rounds, setRounds] = useState([
    { id: 1, name: 'Registration', status: 'upcoming', startTime: null, endTime: null },
    { id: 2, name: 'Round 1: Ideation', status: 'upcoming', startTime: null, endTime: null },
    { id: 3, name: 'Round 2: Development', status: 'upcoming', startTime: null, endTime: null },
    { id: 4, name: 'Round 3: Presentation', status: 'upcoming', startTime: null, endTime: null },
    { id: 5, name: 'Results & Awards', status: 'upcoming', startTime: null, endTime: null }
  ])
  
  const [currentRoundId, setCurrentRoundId] = useState(null)

  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/events/upcoming`)
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }
    fetchEvents()
    
    // Refresh events every 30 seconds
    const interval = setInterval(fetchEvents, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-update round statuses based on dates
  useEffect(() => {
    const updateRoundStatuses = () => {
      const now = Date.now()
      setRounds(prev => prev.map(round => {
        const startTime = round.startTime ? new Date(round.startTime).getTime() : null
        const endTime = round.endTime ? new Date(round.endTime).getTime() : null

        if (startTime && endTime) {
          if (now >= startTime && now <= endTime) {
            return { ...round, status: 'active' }
          } else if (now > endTime) {
            return { ...round, status: 'completed' }
          }
        } else if (startTime && now >= startTime) {
          return { ...round, status: 'active' }
        }
        return round
      }))
    }

    updateRoundStatuses()
    const interval = setInterval(updateRoundStatuses, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRoleChange = (role) => {
    setCurrentRole(role)
  }

  const handleCreateEvent = async (eventData) => {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })
      
      if (response.ok) {
        const newEvent = await response.json()
        setEvents(prev => [...prev, newEvent])
        return newEvent
      } else {
        throw new Error('Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  const handleSaveMarks = (teamId, scores) => {
    setTeamScores(prev => ({
      ...prev,
      [teamId]: scores
    }))
  }

  const getTotalScore = (scores) => {
    if (!scores) return 0
    return Object.values(scores).reduce((sum, score) => sum + score, 0)
  }

  const handleAddAnnouncement = (message) => {
    const newAnnouncement = {
      id: Date.now(),
      message: message,
      timeAgo: 'Just now',
      timestamp: Date.now()
    }
    setAnnouncements(prev => [newAnnouncement, ...prev])
    
    // Update time ago after a moment
    setTimeout(() => {
      setAnnouncements(prev => prev.map(ann => {
        if (ann.id === newAnnouncement.id) {
          const minutesAgo = Math.floor((Date.now() - ann.timestamp) / (60 * 1000))
          if (minutesAgo < 1) return { ...ann, timeAgo: 'Just now' }
          if (minutesAgo < 60) return { ...ann, timeAgo: `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago` }
          const hoursAgo = Math.floor(minutesAgo / 60)
          return { ...ann, timeAgo: `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago` }
        }
        return ann
      }))
    }, 60000) // Update after 1 minute
  }

  const handleAddIdea = (teamId, idea) => {
    const newIdea = {
      id: Date.now(),
      title: idea.title,
      category: idea.category || 'General',
      description: idea.description || '',
      hearts: 0,
      fires: 0,
      stars: 0,
      votes: 0,
      timestamp: Date.now()
    }
    setIdeas(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), newIdea]
    }))
  }

  const handleUploadPPT = (teamId, pptFile) => {
    setTeamPPTs(prev => ({
      ...prev,
      [teamId]: {
        file: pptFile,
        fileName: pptFile.name,
        fileSize: pptFile.size,
        uploadDate: Date.now(),
        url: URL.createObjectURL(pptFile)
      }
    }))
  }

  const handleUpdateRound = (roundId, updates) => {
    setRounds(prev => prev.map(round => 
      round.id === roundId ? { ...round, ...updates } : round
    ))
  }

  const handleSetCurrentRound = (roundId) => {
    const now = Date.now()
    setCurrentRoundId(roundId)
    
    // Update the status of all rounds based on the current round
    setRounds(prev => {
      const currentActiveRound = prev.find(r => r.status === 'active')
      
      return prev.map(round => {
        if (round.id === roundId) {
          // Set the new round as active with current time as start
          return { 
            ...round, 
            status: 'active', 
            startTime: round.startTime || now 
          }
        } else if (round.status === 'active' && round.id !== roundId) {
          // End the previously active round with current time
          return { 
            ...round, 
            status: 'completed', 
            endTime: round.endTime || now 
          }
        } else if (round.id < roundId && round.status !== 'completed') {
          // Mark previous rounds as completed
          return { 
            ...round, 
            status: 'completed', 
            endTime: round.endTime || now 
          }
        } else {
          return { ...round, status: 'upcoming' }
        }
      })
    })
  }

  const getCurrentRound = () => {
    if (!currentRoundId) return null
    return rounds.find(r => r.id === currentRoundId) || null
  }

  const renderDashboard = () => {
    switch (currentRole) {
      case 'Participant':
        return (
          <ParticipantDashboard 
            onRoleChange={handleRoleChange}
            teamScores={teamScores}
            getTotalScore={getTotalScore}
            announcements={announcements}
            ideas={ideas}
            onAddIdea={handleAddIdea}
            teamPPTs={teamPPTs}
            onUploadPPT={handleUploadPPT}
            currentRound={getCurrentRound()}
            currentRole={currentRole}
          />
        )
      case 'Organizer':
        return (
          <OrganizerDashboard 
            onRoleChange={handleRoleChange}
            teamScores={teamScores}
            getTotalScore={getTotalScore}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            rounds={rounds}
            currentRound={getCurrentRound()}
            onUpdateRound={handleUpdateRound}
            onSetCurrentRound={handleSetCurrentRound}
            onCreateEvent={handleCreateEvent}
            currentRole={currentRole}
          />
        )
      case 'Judge':
        return (
          <JudgeDashboard 
            onRoleChange={handleRoleChange}
            teamScores={teamScores}
            onSaveMarks={handleSaveMarks}
            getTotalScore={getTotalScore}
            teamPPTs={teamPPTs}
            currentRound={getCurrentRound()}
            currentRole={currentRole}
          />
        )
      case 'Guest':
      default:
        return <GuestDashboard onRoleChange={handleRoleChange} events={events} currentRole={currentRole} />
    }
  }

  return renderDashboard()
}

export default App
