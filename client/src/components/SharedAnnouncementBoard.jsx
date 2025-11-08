import AnnouncementCard from '../organizerDashboard/AnnouncementCard'
import './SharedAnnouncementBoard.css'

function SharedAnnouncementBoard({ announcements, onAddAnnouncement, canEdit = false }) {
  return (
    <section className="shared-announcement-board-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">📢</span>
          Announcement Board
        </h2>
        {canEdit && (
          <button className="new-announcement-button" onClick={onAddAnnouncement}>
            <span>+</span>
            New Announcement
          </button>
        )}
      </div>
      <div className="announcements-list">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              message={announcement.message}
              timeAgo={announcement.timeAgo}
            />
          ))
        ) : (
          <div className="no-announcements">
            <p>No announcements yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default SharedAnnouncementBoard

