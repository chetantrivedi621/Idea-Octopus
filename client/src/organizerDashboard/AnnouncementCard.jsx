import './AnnouncementCard.css'

function AnnouncementCard({ message, timeAgo }) {
  return (
    <div className="announcement-card">
      <div className="announcement-content">
        <div className="announcement-message">{message}</div>
        <div className="announcement-separator"></div>
        <div className="announcement-time-wrapper">
          <span className="announcement-time">{timeAgo}</span>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementCard

