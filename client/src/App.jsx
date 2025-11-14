import { useState, useEffect, useCallback } from 'react'
import GuestDashboard from './guestDashboard/GuestDashboard'
import TeamDashboard from './participantDashboard/ParticipantDashboard'
import OrganizerDashboard from './organizerDashboard/OrganizerDashboard'
import JudgeDashboard from './judgeDashboard/JudgeDashboard'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function App() {
  // Get role from localStorage if available, otherwise default to 'Guest'
  const [currentRole, setCurrentRole] = useState(() => {
    const savedRole = localStorage.getItem('role')
    return savedRole || 'Guest'
  })
  const [events, setEvents] = useState([])
  const [completedEvents, setCompletedEvents] = useState([])
  const [currentEvent, setCurrentEvent] = useState(null)

  // Update role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('role')
    if (savedRole) {
      setCurrentRole(savedRole)
    }
    // Load current event from localStorage if available
    const savedEvent = localStorage.getItem('currentEvent')
    if (savedEvent) {
      try {
        setCurrentEvent(JSON.parse(savedEvent))
      } catch (e) {
        console.error('Error parsing saved event:', e)
      }
    }
  }, [])

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
      message: 'Welcome to HackCapsule 2024!',
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

  // Load rounds from event data
  const loadRoundsFromEvent = useCallback((event) => {
    if (event && event.rounds && Array.isArray(event.rounds)) {
      const loadedRounds = event.rounds.map((round, index) => {
        const now = Date.now()
        const startTime = round.startTime ? new Date(round.startTime).getTime() : null
        const endTime = round.endTime ? new Date(round.endTime).getTime() : null
        
        let status = 'upcoming'
        if (startTime && endTime) {
          if (now >= startTime && now <= endTime) {
            status = 'active'
          } else if (now > endTime) {
            status = 'completed'
          }
        } else if (startTime && now >= startTime) {
          status = 'active'
        }
        
        return {
          id: round._id || round.id || index + 1,
          _id: round._id,
          name: round.name || `Round ${index + 1}`,
          startTime: startTime,
          endTime: endTime,
          status: status,
          order: round.order || index + 1
        }
      }).sort((a, b) => (a.order || 0) - (b.order || 0))
      
      setRounds(loadedRounds)
    }
  }, [])

  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/events/upcoming`)
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
          
          // If we have a current event, update it from the fetched data
          setCurrentEvent(prev => {
            if (prev) {
              const updatedEvent = data.find(e => 
                (e._id && e._id === prev._id) || 
                (e.id && e.id === prev._id) ||
                (e._id && prev._id && e._id.toString() === prev._id.toString())
              )
              if (updatedEvent) {
                localStorage.setItem('currentEvent', JSON.stringify(updatedEvent))
                return updatedEvent
              }
            } else if (data.length > 0) {
              // If no current event, use the first upcoming event
              localStorage.setItem('currentEvent', JSON.stringify(data[0]))
              return data[0]
            }
            return prev
          })
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

  // Fetch completed events for organizers
  useEffect(() => {
    if (currentRole === 'Organizer') {
      const fetchCompletedEvents = async () => {
        try {
          const response = await fetch(`${API_URL}/events/completed`)
          if (response.ok) {
            const data = await response.json()
            setCompletedEvents(data)
          }
        } catch (error) {
          console.error('Error fetching completed events:', error)
        }
      }
      fetchCompletedEvents()
      
      // Refresh completed events every 30 seconds
      const interval = setInterval(fetchCompletedEvents, 30000)
      return () => clearInterval(interval)
    }
  }, [currentRole])

  // Load rounds when current event changes
  useEffect(() => {
    if (currentEvent) {
      loadRoundsFromEvent(currentEvent)
    }
  }, [currentEvent, loadRoundsFromEvent])

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

  const handleUpdateEvent = async (updatedEvent) => {
    try {
      // Update the current event state
      setCurrentEvent(updatedEvent)
      localStorage.setItem('currentEvent', JSON.stringify(updatedEvent))
      
      // Update events list
      setEvents(prev => prev.map(e => 
        (e._id && e._id === updatedEvent._id) || (e.id && e.id === updatedEvent._id)
          ? updatedEvent
          : e
      ))
      
      return updatedEvent
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  const handleCreateEvent = async (eventData) => {
    try {
      // Convert Date objects to ISO strings for JSON serialization
      const serializedData = {
        ...eventData,
        startDate: eventData.startDate instanceof Date ? eventData.startDate.toISOString() : eventData.startDate,
        endDate: eventData.endDate instanceof Date ? eventData.endDate.toISOString() : eventData.endDate,
        rounds: eventData.rounds?.map(round => ({
          ...round,
          startTime: round.startTime instanceof Date ? round.startTime.toISOString() : round.startTime,
          endTime: round.endTime instanceof Date ? round.endTime.toISOString() : round.endTime
        }))
      }

      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serializedData)
      })
      
      if (response.ok) {
        const newEvent = await response.json()
        // Add the new event to the state
        setEvents(prev => {
          // Check if event already exists (avoid duplicates)
          const exists = prev.some(e => e._id === newEvent._id || e.id === newEvent._id)
          if (exists) {
            return prev.map(e => (e._id === newEvent._id || e.id === newEvent._id) ? newEvent : e)
          }
          return [newEvent, ...prev]
        })
        
        // Set the newly created event as the current event and load its rounds
        setCurrentEvent(newEvent)
        localStorage.setItem('currentEvent', JSON.stringify(newEvent))
        loadRoundsFromEvent(newEvent)
        
        // Also refresh the events list to ensure consistency
        try {
          const refreshResponse = await fetch(`${API_URL}/events/upcoming`)
          if (refreshResponse.ok) {
            const refreshedEvents = await refreshResponse.json()
            // Merge with existing events to ensure newly created event is visible
            setEvents(prev => {
              const merged = [...refreshedEvents]
              // Add the new event if it's not already in the refreshed list
              const existsInRefreshed = refreshedEvents.some(e => 
                (e._id && e._id === newEvent._id) || (e.id && e.id === newEvent._id)
              )
              if (!existsInRefreshed) {
                merged.unshift(newEvent)
              }
              return merged
            })
            
            // Update current event if it's in the refreshed list
            const updatedEvent = refreshedEvents.find(e => 
              (e._id && e._id === newEvent._id) || (e.id && e.id === newEvent._id)
            )
            if (updatedEvent) {
              setCurrentEvent(updatedEvent)
              localStorage.setItem('currentEvent', JSON.stringify(updatedEvent))
              loadRoundsFromEvent(updatedEvent)
            }
          }
        } catch (refreshError) {
          console.error('Error refreshing events:', refreshError)
          // Continue even if refresh fails, we already added the event
        }
        
        return newEvent
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create event' }))
        throw new Error(errorData.error || 'Failed to create event')
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

  const handleAddIdea = async (teamId, idea) => {
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

    // Track participation in current event
    if (currentEvent && currentEvent._id) {
      try {
        await fetch(`${API_URL}/events/${currentEvent._id}/participate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ teamId })
        })
      } catch (participationError) {
        console.error('Error tracking participation:', participationError)
        // Continue even if participation tracking fails
      }
    }
  }

  const handleUploadPPT = async (teamId, pptFile, teamName) => {
    try {
      // Upload to server first
      const { uploadPPT } = await import('./api/api.js')
      const result = await uploadPPT({ 
        teamName: teamName || `Team ${teamId}`, 
        file: pptFile 
      })
      
      // Track participation in current event
      if (currentEvent && currentEvent._id) {
        try {
          await fetch(`${API_URL}/events/${currentEvent._id}/participate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teamId })
          })
        } catch (participationError) {
          console.error('Error tracking participation:', participationError)
          // Continue even if participation tracking fails
        }
      }
      
      // Store in local state for immediate display
      setTeamPPTs(prev => ({
        ...prev,
        [teamId]: {
          file: pptFile,
          fileName: pptFile.name,
          fileSize: pptFile.size,
          uploadDate: Date.now(),
          url: URL.createObjectURL(pptFile),
          deckId: result.deckId,
          jobId: result.jobId
        }
      }))
      
      console.log('PPT uploaded successfully:', result)
    } catch (error) {
      console.error('Error uploading PPT:', error)
      // Still store locally even if upload fails
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
      throw error
    }
  }

  const handleUpdateRound = async (roundId, updates) => {
    // Update local state immediately
    setRounds(prev => prev.map(round => 
      round.id === roundId ? { ...round, ...updates } : round
    ))
    
    // Sync with backend if we have a current event
    if (currentEvent && currentEvent._id) {
      try {
        const round = rounds.find(r => r.id === roundId)
        if (round && round._id) {
          // Update the round on the backend
          const roundResponse = await fetch(`${API_URL}/rounds/${round._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...updates,
              startTime: updates.startTime ? new Date(updates.startTime).toISOString() : undefined,
              endTime: updates.endTime ? new Date(updates.endTime).toISOString() : undefined
            })
          })
          
          if (roundResponse.ok) {
            // Refresh the event to get updated rounds
            const eventResponse = await fetch(`${API_URL}/events/${currentEvent._id}`)
            if (eventResponse.ok) {
              const updatedEvent = await eventResponse.json()
              setCurrentEvent(updatedEvent)
              localStorage.setItem('currentEvent', JSON.stringify(updatedEvent))
              loadRoundsFromEvent(updatedEvent)
            }
          }
        }
      } catch (error) {
        console.error('Error updating round on backend:', error)
        // Continue even if backend update fails
      }
    }
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
          <TeamDashboard 
            onRoleChange={handleRoleChange}
            teamScores={teamScores}
            getTotalScore={getTotalScore}
            announcements={announcements}
            ideas={ideas}
            onAddIdea={handleAddIdea}
            teamPPTs={teamPPTs}
            onUploadPPT={handleUploadPPT}
            currentRound={getCurrentRound()}
            events={events}
            currentRole={currentRole}
            onFetchParticipantEvents={async (teamId) => {
              try {
                const response = await fetch(`${API_URL}/events/participant/${teamId}`)
                if (response.ok) {
                  const data = await response.json()
                  return data
                }
                return []
              } catch (error) {
                console.error('Error fetching participant events:', error)
                return []
              }
            }}
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
            teamPPTs={teamPPTs}
            onSaveMarks={handleSaveMarks}
            currentRole={currentRole}
            currentEvent={currentEvent}
            onUpdateEvent={handleUpdateEvent}
            completedEvents={completedEvents}
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
