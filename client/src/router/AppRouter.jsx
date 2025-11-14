import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import IdeaBoard from '../pages/IdeaBoard'
import TeamIdeaBoard from '../pages/TeamIdeaBoard'
import App from '../App'
import EventDetailsPage from '../pages/EventDetailsPage'
import LoginSelect from '../pages/LoginSelect'
import SignUp from '../pages/SignUp'
import StudentLogin from '../pages/StudentLogin'
import JudgeLogin from '../pages/JudgeLogin'
import TeamLogin from '../pages/TeamLogin'
import VisitorLogin from '../pages/VisitorLogin'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/ideas" element={<IdeaBoard />} />
      <Route path="/team-idea-board" element={<TeamIdeaBoard />} />
      <Route path="/dashboard" element={<App />} />
      <Route path="/event/:eventId" element={<EventDetailsPage />} />
      <Route path="/login" element={<LoginSelect />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login/student" element={<StudentLogin />} />
      <Route path="/login/judge" element={<JudgeLogin />} />
      <Route path="/login/team" element={<TeamLogin />} />
      <Route path="/login/visitor" element={<VisitorLogin />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  )
}

export default AppRouter

