// src/api/endpoints.js
// Small centralized route constants / helpers for readability in components.

const base = '/api' // note: client uses VITE_API so these are path-only constants

export const ROUTES = {
  HEALTH: `${base}/health`,

  // Ideas
  IDEAS: () => `${base}/ideas`,
  IDEA_REACT: (ideaId) => `${base}/react/${ideaId}`,
  TOP: `${base}/top`,

  // Submissions & QR
  SUBMISSIONS: () => `${base}/submissions`,
  JUDGE_TEAM: (teamName) => `${base}/judges/team/${encodeURIComponent(teamName)}`,
  QR_TEAM: (teamName) => `${base}/qr/${encodeURIComponent(teamName)}`,

  // Judge actions
  JUDGE_SCORE: `${base}/judge/score`
}

// small helpers if you want purely-string routes without calling API helper functions:
export const endpoints = {
  getIdeas: () => ROUTES.IDEAS(),
  postIdea: () => ROUTES.IDEAS(),
  reactIdea: (id) => ROUTES.IDEA_REACT(id),
  uploadSubmission: () => ROUTES.SUBMISSIONS(),
  getQR: (teamName) => ROUTES.QR_TEAM(teamName),
  getJudgeTeam: (teamName) => ROUTES.JUDGE_TEAM(teamName),
  postJudgeScore: () => ROUTES.JUDGE_SCORE
}

export default endpoints
