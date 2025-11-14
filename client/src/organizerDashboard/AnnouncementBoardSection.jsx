import AnnouncementCard from './AnnouncementCard'
import './AnnouncementBoardSection.css'

function AnnouncementBoardSection() {
  const announcements = [
    {
      id: 1,
      message: 'Welcome to HackCapsule 2024!',
      timeAgo: '2 hours ago'
    },
    {
      id: 2,
      message: 'Submissions close at 6 PM today',
      timeAgo: '5 hours ago'
    }
  ]

  return (
    <section className="announcement-board-section">
      <div className="section-header">
        <h2 className="section-title">Announcement Board</h2>
        <button className="new-announcement-button">
          <span>+</span>
          New Announcement
        </button>
      </div>
      <div className="announcements-list">
        {announcements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            message={announcement.message}
            timeAgo={announcement.timeAgo}
          />
        ))}
      </div>
    </section>
  )
}

export default AnnouncementBoardSection

