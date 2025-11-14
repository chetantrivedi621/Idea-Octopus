import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from './models/User.js'
import Idea from './models/Idea.js'
import StickyNote from './models/StickyNote.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  })

  // Store active users per team
  const teamUsers = new Map() // teamId -> Set of socketIds

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      const decoded = jwt.verify(token, JWT_SECRET)
      const user = await User.findById(decoded.userId).select('-password')

      if (!user) {
        return next(new Error('Authentication error: User not found'))
      }

      socket.userId = user._id.toString()
      socket.userName = user.name
      socket.userEmail = user.email || user.teamIdString || null
      socket.teamId = user.teamId ? user.teamId.toString() : null
      socket.teamIdString = user.teamIdString || null
      socket.teamRole = user.teamRole || 'member'

      next()
    } catch (error) {
      next(new Error('Authentication error: ' + error.message))
    }
  })

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`)

    // Join team room if user belongs to a team
    if (socket.teamId) {
      const teamRoom = `team:${socket.teamId}`
      socket.join(teamRoom)

      // Track active users
      if (!teamUsers.has(socket.teamId)) {
        teamUsers.set(socket.teamId, new Set())
      }
      teamUsers.get(socket.teamId).add(socket.id)

      // Notify team members that someone joined
      socket.to(teamRoom).emit('team:member-joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date().toISOString()
      })

      // Send current active members to the new user
      const activeMembers = Array.from(teamUsers.get(socket.teamId)).map(socketId => {
        const memberSocket = io.sockets.sockets.get(socketId)
        return memberSocket ? {
          userId: memberSocket.userId,
          userName: memberSocket.userName
        } : null
      }).filter(Boolean)

      socket.emit('team:active-members', activeMembers)

      console.log(`👥 User ${socket.userName} joined team room: ${teamRoom}`)
      
      // Send initial ideas list to the new user (async IIFE to handle await)
      ;(async () => {
        try {
          const ideas = await Idea.find({ teamId: socket.teamId })
            .populate('teamId')
            .sort({ createdAt: -1 })
            .limit(50) // Limit to recent 50 ideas
          
          socket.emit('ideas:initial-load', {
            ideas: ideas.map(idea => idea.toObject()),
            timestamp: new Date().toISOString()
          })
        } catch (error) {
          console.error('Error loading initial ideas:', error)
        }
      })()
    }

    // Handle idea updates (from socket)
    socket.on('idea:update', async (data) => {
      if (!socket.teamId) {
        socket.emit('error', { message: 'You must be part of a team to update ideas' })
        return
      }

      try {
        const { ideaId, updates } = data
        
        if (!ideaId) {
          socket.emit('error', { message: 'Idea ID is required' })
          return
        }

        // Find and update idea
        const idea = await Idea.findById(ideaId)
        if (!idea) {
          socket.emit('error', { message: 'Idea not found' })
          return
        }

        // Verify idea belongs to user's team
        if (idea.teamId.toString() !== socket.teamId) {
          socket.emit('error', { message: 'You can only update ideas from your team' })
          return
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
          if (updates[key] !== undefined) {
            idea[key] = updates[key]
          }
        })
        idea.updatedAt = new Date()
        
        await idea.save()
        await idea.populate('teamId')
        
        const teamRoom = `team:${socket.teamId}`
        const ideaData = idea.toObject()

        // Broadcast to all team members (including sender)
        io.to(teamRoom).emit('idea:updated', {
          ideaId: idea._id,
          idea: ideaData,
          updates,
          updatedBy: {
            userId: socket.userId,
            userName: socket.userName
          },
          timestamp: new Date().toISOString()
        })
        
        console.log(`✏️ Idea updated by ${socket.userName} in team ${socket.teamId}: ${ideaId}`)
      } catch (error) {
        console.error('Error updating idea via socket:', error)
        socket.emit('error', { message: 'Failed to update idea: ' + error.message })
      }
    })

    // Handle idea creation (from socket)
    socket.on('idea:create', async (data) => {
      if (!socket.teamId) {
        socket.emit('error', { message: 'You must be part of a team to create ideas' })
        return
      }

      try {
        const { title, description, category } = data
        
        if (!title) {
          socket.emit('error', { message: 'Idea title is required' })
          return
        }

        // Create and save idea to database
        const idea = new Idea({
          teamId: socket.teamId,
          title,
          description: description || '',
          category: category || 'General',
          hearts: 0,
          fires: 0,
          stars: 0,
          votes: 0
        })
        
        await idea.save()
        await idea.populate('teamId')
        
        const teamRoom = `team:${socket.teamId}`
        const ideaData = idea.toObject()

        // Broadcast to all team members (including sender)
        io.to(teamRoom).emit('idea:created', {
          idea: ideaData,
          createdBy: {
            userId: socket.userId,
            userName: socket.userName
          },
          timestamp: new Date().toISOString()
        })
        
        console.log(`💡 Idea created by ${socket.userName} in team ${socket.teamId}: ${title}`)
      } catch (error) {
        console.error('Error creating idea via socket:', error)
        socket.emit('error', { message: 'Failed to create idea: ' + error.message })
      }
    })

    // Handle idea reactions (votes, hearts, fires, stars) from socket
    socket.on('idea:react', async (data) => {
      if (!socket.teamId) {
        socket.emit('error', { message: 'You must be part of a team to react to ideas' })
        return
      }

      try {
        const { ideaId, reactionType, emoji } = data
        
        if (!ideaId) {
          socket.emit('error', { message: 'Idea ID is required' })
          return
        }

        // Determine reaction type from emoji or reactionType
        const reaction = reactionType || emoji
        const validReactions = ['fire', 'heart', 'star', 'vote']
        
        if (!validReactions.includes(reaction)) {
          socket.emit('error', { message: 'Invalid reaction type. Use: fire, heart, star, or vote' })
          return
        }

        // Find idea
        const idea = await Idea.findById(ideaId)
        if (!idea) {
          socket.emit('error', { message: 'Idea not found' })
          return
        }

        // Verify idea belongs to user's team
        if (idea.teamId.toString() !== socket.teamId) {
          socket.emit('error', { message: 'You can only react to ideas from your team' })
          return
        }

        // Increment the corresponding reaction count
        if (reaction === 'fire') idea.fires = (idea.fires || 0) + 1
        else if (reaction === 'heart') idea.hearts = (idea.hearts || 0) + 1
        else if (reaction === 'star') idea.stars = (idea.stars || 0) + 1
        else if (reaction === 'vote') idea.votes = (idea.votes || 0) + 1
        
        await idea.save()
        await idea.populate('teamId')
        
        const teamRoom = `team:${socket.teamId}`
        const ideaData = idea.toObject()

        // Broadcast to all team members (including sender)
        io.to(teamRoom).emit('idea:reacted', {
          ideaId: idea._id,
          idea: ideaData,
          reactionType: reaction,
          reactedBy: {
            userId: socket.userId,
            userName: socket.userName
          },
          timestamp: new Date().toISOString()
        })
        
        console.log(`👍 Reaction (${reaction}) added by ${socket.userName} to idea ${ideaId}`)
      } catch (error) {
        console.error('Error reacting to idea via socket:', error)
        socket.emit('error', { message: 'Failed to react to idea: ' + error.message })
      }
    })

    // Handle PPT upload notifications
    socket.on('ppt:uploaded', async (data) => {
      if (!socket.teamId) return

      const { pptInfo } = data
      const teamRoom = `team:${socket.teamId}`

      socket.to(teamRoom).emit('ppt:uploaded-notification', {
        pptInfo,
        uploadedBy: {
          userId: socket.userId,
          userName: socket.userName
        },
        timestamp: new Date().toISOString()
      })
    })

    // Handle idea deletion (from socket)
    socket.on('idea:delete', async (data) => {
      if (!socket.teamId) {
        socket.emit('error', { message: 'You must be part of a team to delete ideas' })
        return
      }

      try {
        const { ideaId } = data
        
        if (!ideaId) {
          socket.emit('error', { message: 'Idea ID is required' })
          return
        }

        // Find idea
        const idea = await Idea.findById(ideaId)
        if (!idea) {
          socket.emit('error', { message: 'Idea not found' })
          return
        }

        // Verify idea belongs to user's team
        if (idea.teamId.toString() !== socket.teamId) {
          socket.emit('error', { message: 'You can only delete ideas from your team' })
          return
        }

        await idea.deleteOne()
        
        const teamRoom = `team:${socket.teamId}`

        // Broadcast to all team members (including sender)
        io.to(teamRoom).emit('idea:deleted', {
          ideaId: idea._id,
          deletedBy: {
            userId: socket.userId,
            userName: socket.userName
          },
          timestamp: new Date().toISOString()
        })
        
        console.log(`🗑️ Idea deleted by ${socket.userName} in team ${socket.teamId}: ${ideaId}`)
      } catch (error) {
        console.error('Error deleting idea via socket:', error)
        socket.emit('error', { message: 'Failed to delete idea: ' + error.message })
      }
    })

    // Handle idea refresh request
    socket.on('ideas:refresh', async () => {
      if (!socket.teamId) return
      
      try {
        const ideas = await Idea.find({ teamId: socket.teamId })
          .populate('teamId')
          .sort({ createdAt: -1 })
          .limit(50)
        
        socket.emit('ideas:refreshed', {
          ideas: ideas.map(idea => idea.toObject()),
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error refreshing ideas:', error)
        socket.emit('error', { message: 'Failed to refresh ideas' })
      }
    })

    // Handle whiteboard drawing
    socket.on('whiteboard:drawing', (data) => {
      if (!socket.teamId) return
      const teamRoom = `team:${socket.teamId}`
      socket.to(teamRoom).emit('whiteboard:drawing', data)
    })

    // Handle sticky note creation
    socket.on('whiteboard:sticky-create', async (data) => {
      if (!socket.teamId) return
      const teamRoom = `team:${socket.teamId}`
      
      try {
        const { sticky } = data
        if (sticky && sticky.id) {
          // Save to database
          const note = await StickyNote.findOneAndUpdate(
            { noteId: sticky.id },
            {
              teamId: socket.teamId,
              noteId: sticky.id,
              text: sticky.text || '',
              x: sticky.x || 100,
              y: sticky.y || 100,
              color: sticky.color || '#FFE66D',
              width: sticky.width || 200,
              height: sticky.height || 150
            },
            { upsert: true, new: true }
          )
          
          // Broadcast to team
          io.to(teamRoom).emit('whiteboard:sticky-created', { sticky: { ...sticky, _id: note._id } })
        } else {
          io.to(teamRoom).emit('whiteboard:sticky-created', data)
        }
      } catch (error) {
        console.error('Error saving sticky note:', error)
        // Still broadcast even if save fails
        io.to(teamRoom).emit('whiteboard:sticky-created', data)
      }
    })

    // Handle sticky note update
    socket.on('whiteboard:sticky-update', async (data) => {
      if (!socket.teamId) return
      const teamRoom = `team:${socket.teamId}`
      
      try {
        const { sticky } = data
        if (sticky && sticky.id) {
          // Update in database
          const note = await StickyNote.findOneAndUpdate(
            { noteId: sticky.id },
            {
              text: sticky.text !== undefined ? sticky.text : undefined,
              x: sticky.x !== undefined ? sticky.x : undefined,
              y: sticky.y !== undefined ? sticky.y : undefined,
              color: sticky.color !== undefined ? sticky.color : undefined,
              width: sticky.width !== undefined ? sticky.width : undefined,
              height: sticky.height !== undefined ? sticky.height : undefined,
              updatedAt: new Date()
            },
            { new: true }
          )
          
          if (note) {
            // Broadcast to team
            io.to(teamRoom).emit('whiteboard:sticky-updated', { sticky: { ...sticky, _id: note._id } })
          } else {
            io.to(teamRoom).emit('whiteboard:sticky-updated', data)
          }
        } else {
          io.to(teamRoom).emit('whiteboard:sticky-updated', data)
        }
      } catch (error) {
        console.error('Error updating sticky note:', error)
        // Still broadcast even if save fails
        io.to(teamRoom).emit('whiteboard:sticky-updated', data)
      }
    })

    // Handle sticky note deletion
    socket.on('whiteboard:sticky-delete', async (data) => {
      if (!socket.teamId) return
      const teamRoom = `team:${socket.teamId}`
      
      try {
        const { stickyId } = data
        if (stickyId) {
          // Delete from database
          await StickyNote.findOneAndDelete({ noteId: stickyId })
        }
        
        // Broadcast to team
        io.to(teamRoom).emit('whiteboard:sticky-deleted', data)
      } catch (error) {
        console.error('Error deleting sticky note:', error)
        // Still broadcast even if delete fails
        io.to(teamRoom).emit('whiteboard:sticky-deleted', data)
      }
    })

    // Handle text creation
    socket.on('whiteboard:text-create', (data) => {
      if (!socket.teamId) return
      const teamRoom = `team:${socket.teamId}`
      io.to(teamRoom).emit('whiteboard:text-created', data)
    })

    // Handle text update
    socket.on('whiteboard:text-update', (data) => {
      if (!socket.teamId) return
      const teamRoom = `team:${socket.teamId}`
      io.to(teamRoom).emit('whiteboard:text-updated', data)
    })

    // Handle text deletion
    socket.on('whiteboard:text-delete', (data) => {
      if (!socket.teamId) return
      const teamRoom = `team:${socket.teamId}`
      io.to(teamRoom).emit('whiteboard:text-deleted', data)
    })

    // Handle whiteboard clear
    socket.on('whiteboard:clear', () => {
      if (!socket.teamId) return
      const teamRoom = `team:${socket.teamId}`
      io.to(teamRoom).emit('whiteboard:clear')
    })

    // Handle typing indicators (for future chat features)
    socket.on('typing:start', () => {
      if (!socket.teamId) return
      socket.to(`team:${socket.teamId}`).emit('typing:indicator', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: true
      })
    })

    socket.on('typing:stop', () => {
      if (!socket.teamId) return
      socket.to(`team:${socket.teamId}`).emit('typing:indicator', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: false
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userName} (${socket.userId})`)

      if (socket.teamId) {
        const teamRoom = `team:${socket.teamId}`
        
        // Remove from active users
        if (teamUsers.has(socket.teamId)) {
          teamUsers.get(socket.teamId).delete(socket.id)
          if (teamUsers.get(socket.teamId).size === 0) {
            teamUsers.delete(socket.teamId)
          }
        }

        // Notify team members
        socket.to(teamRoom).emit('team:member-left', {
          userId: socket.userId,
          userName: socket.userName,
          timestamp: new Date().toISOString()
        })
      }
    })
  })

  return io
}

