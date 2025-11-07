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
      const message = data?.error || data?.message || 'Server error'
      throw { status, message, raw: data }
    }
    // network or other error
    throw { status: 0, message: err.message || 'Network error', raw: err }
  }
}

/* ----- Convenience API functions (used by components) ----- */

// Health check
export const getHealth = () => request('get', '/health')

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

export const getSubmissionForTeam = (teamName) =>
  request('get', `/judges/team/${encodeURIComponent(teamName)}`)

// QR
export const getQRForTeam = (teamName) =>
  request('get', `/qr/${encodeURIComponent(teamName)}`)

// Judge scoring
export const postJudgeScore = (payload) => request('post', '/judge/score', payload)
// payload: { teamName, judgeName, score, comment }

/* ----- Export default for convenience ----- */
export default {
  getHealth,
  getIdeas,
  postIdea,
  reactIdea,
  getTopIdeas,
  uploadSubmission,
  getSubmissionForTeam,
  getQRForTeam,
  postJudgeScore
}
