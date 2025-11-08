import './AnnouncementCard.css'

function AnnouncementCard({ message, timeAgo }) {
  return (
    <div className="announcement-card">
      <div className="announcement-message">{message}</div>
      <div className="announcement-time">{timeAgo}</div>
    </div>
  )
}

export default AnnouncementCard

