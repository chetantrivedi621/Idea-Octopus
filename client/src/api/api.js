// src/api/api.js
import axios from 'axios'
import qs from 'qs'

const API_BASE = import.meta.env.VITE_API || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // keep if you plan on cookies / auth
  headers: {
    'Content-Type': 'application/json'
  },
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' })
})

// tiny wrapper to keep call-sites clean and consistent
async function request(method, url, data = null, config = {}) {
  try {
    const res = await api.request({ method, url, data, ...config })
    return res.data
  } catch (err) {
    // normalized error object
    if (err.response) {
      // server responded with non-2xx
      const { status, data } = err.response
      
      // Extract error message from response
      let message = 'Server error'
      if (data) {
        if (data.message) {
          message = data.message
        } else if (data.error) {
          message = data.error
        } else if (data.success === false && data.message) {
          message = data.message
        } else if (typeof data === 'string') {
          message = data
        }
      }
      
      throw { 
        status, 
        message, 
        raw: data, 
        response: err.response,
        success: data?.success || false
      }
    }
    
    // network or other error (server not reachable, CORS, etc.)
    let errorMessage = 'Network error: Unable to connect to server'
    if (err.code === 'ECONNREFUSED') {
      errorMessage = `Network error: Cannot connect to server at ${API_BASE}. Please ensure the server is running on port 8080.`
    } else if (err.message) {
      errorMessage = err.message
      if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        errorMessage = `Network error: Cannot connect to server at ${API_BASE}. Please check if the server is running.`
      }
    }
    
    throw { 
      status: 0, 
      message: errorMessage, 
      raw: err, 
      code: err.code,
      success: false
    }
  }
}

/* ----- Convenience API functions (used by components) ----- */

// Health check
export const getHealth = () => request('get', '/health')

// Authentication
export const signup = (payload) => request('post', '/auth/signup', payload)
// payload: { name, email, password, confirmPassword, role }

export const login = (payload) => request('post', '/auth/login', payload)
// payload: { email, password, role? }

export const getCurrentUser = () => request('get', '/auth/me')

// Ideas
export const getIdeas = (opts = {}) => {
  // opts: { sort: 'popular'|'new', limit: number, q: string }
  const qs = []
  if (opts.sort) qs.push(`sort=${opts.sort}`)
  return request('get', `/ideas?${qs.join('&')}`)
}
export const postIdea = (payload) => request('post', '/ideas', payload) // { teamName, title, description }
export const reactIdea = (ideaId, emoji) => request('post', `/react/${ideaId}`, { emoji })

// Top / Featured
export const getTopIdeas = () => request('get', '/top')

// Submissions (file upload)
export const uploadSubmission = async ({ teamName, title, file }) => {
  // file: File object from <input type="file" />
  const fd = new FormData()
  fd.append('teamName', teamName)
  fd.append('title', title)
  fd.append('file', file)

  // Axios will set correct multipart headers; don't set JSON content-type
  return request('post', '/submissions', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Upload PPT/Deck to server (new GitHub structure)
export const uploadPPT = async ({ teamName, file }) => {
  const fd = new FormData()
  fd.append('file', file)
  if (teamName) {
    fd.append('teamName', teamName)
  }

  return request('post', '/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getSubmissionForTeam = (teamName) =>
  request('get', `/judges/team/${encodeURIComponent(teamName)}`)

// QR
export const getQRForTeam = (teamName) =>
  request('get', `/qr/${encodeURIComponent(teamName)}`)

// Judge scoring
export const postJudgeScore = (payload) => request('post', '/judge/score', payload)
// payload: { teamName, judgeName, score, comment }

// AI Summary
export const getAISummary = (teamName) => 
  request('get', `/ai/summary/${encodeURIComponent(teamName)}`)

export const refreshAISummary = (teamName) => 
  request('post', '/ai/summary/refresh', { teamName })

// Image Upload (GridFS)
export const uploadImage = async ({ file, type = 'general' }) => {
  // file: File object from <input type="file" />
  // type: 'banner', 'winner', 'gallery', 'memory', or 'general'
  const fd = new FormData()
  fd.append('image', file)
  fd.append('type', type)

  return request('post', '/images/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Get image URL helper
export const getImageUrl = (filename) => {
  if (!filename) return null
  const baseUrl = API_BASE.replace('/api', '')
  return `${baseUrl}/api/images/${filename}`
}

// Get image URL by fileId
export const getImageUrlById = (fileId) => {
  if (!fileId) return null
  const baseUrl = API_BASE.replace('/api', '')
  return `${baseUrl}/api/images/id/${fileId}`
}

// Get team information
export const getTeam = (teamId) => request('get', `/teams/${teamId}`)

// Get team by name
export const getTeamByName = async (teamName) => {
  const teams = await request('get', '/teams')
  return teams.find(team => team.name === teamName || team.name.toLowerCase() === teamName.toLowerCase())
}

// Get ideas for a specific team
export const getTeamIdeas = (teamId) => request('get', `/ideas/team/${teamId}`)

// Judge Management
export const getJudges = () => request('get', '/judges')
export const createJudge = (payload) => request('post', '/judges', payload)
// payload: { name, email, password }
export const deleteJudge = (judgeId) => request('delete', `/judges/${judgeId}`)

// Sticky Notes
export const getStickyNotes = (teamId) => request('get', `/sticky-notes/team/${teamId}`)
export const createStickyNote = (payload) => request('post', '/sticky-notes', payload)
// payload: { teamId, noteId, text, x, y, color, width, height }
export const updateStickyNote = (noteId, payload) => request('patch', `/sticky-notes/${noteId}`, payload)
export const deleteStickyNote = (noteId) => request('delete', `/sticky-notes/${noteId}`)
export const bulkUpdateStickyNotes = (payload) => request('post', '/sticky-notes/bulk', payload)
// payload: { teamId, notes: [...] }

/* ----- Export default for convenience ----- */
export default {
  getHealth,
  signup,
  login,
  getCurrentUser,
  getIdeas,
  postIdea,
  reactIdea,
  getTopIdeas,
  uploadSubmission,
  uploadPPT,
  getSubmissionForTeam,
  getQRForTeam,
  postJudgeScore,
  getAISummary,
  refreshAISummary
}
