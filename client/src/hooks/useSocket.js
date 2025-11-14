import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080'

export function useSocket(teamId) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeMembers, setActiveMembers] = useState([])
  const [error, setError] = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!teamId) return

    const token = localStorage.getItem('token')
    if (!token) {
      setError('No authentication token found')
      return
    }

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    })

    socketRef.current = newSocket

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected')
      setIsConnected(true)
      setError(null)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      setError(err.message)
      setIsConnected(false)
    })

    // Team events
    newSocket.on('team:active-members', (members) => {
      setActiveMembers(members)
    })

    newSocket.on('team:member-joined', (data) => {
      console.log('Team member joined:', data)
      // Refresh active members list
      // The server will send updated list
    })

    newSocket.on('team:member-left', (data) => {
      console.log('Team member left:', data)
      // Refresh active members list
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [teamId])

  // Emit idea update
  const emitIdeaUpdate = (ideaId, updates) => {
    if (socket && isConnected) {
      socket.emit('idea:update', { ideaId, updates })
    }
  }

  // Emit idea creation
  const emitIdeaCreate = (idea) => {
    if (socket && isConnected) {
      socket.emit('idea:create', { idea })
    }
  }

  // Emit idea reaction
  const emitIdeaReact = (ideaId, reactionType) => {
    if (socket && isConnected) {
      socket.emit('idea:react', { ideaId, reactionType })
    }
  }

  // Emit PPT upload notification
  const emitPPTUploaded = (pptInfo) => {
    if (socket && isConnected) {
      socket.emit('ppt:uploaded', { pptInfo })
    }
  }

  // Typing indicators
  const emitTypingStart = () => {
    if (socket && isConnected) {
      socket.emit('typing:start')
    }
  }

  const emitTypingStop = () => {
    if (socket && isConnected) {
      socket.emit('typing:stop')
    }
  }

  return {
    socket,
    isConnected,
    activeMembers,
    error,
    emitIdeaUpdate,
    emitIdeaCreate,
    emitIdeaReact,
    emitPPTUploaded,
    emitTypingStart,
    emitTypingStop
  }
}

