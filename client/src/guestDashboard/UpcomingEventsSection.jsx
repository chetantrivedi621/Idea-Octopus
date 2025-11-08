import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import EventDetails from '../components/EventDetails'
import './UpcomingEventsSection.css'

function UpcomingEventsSection({ events = [], onEventClick }) {
  const [selectedEvent, setSelectedEvent] = useState(null)

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    if (onEventClick) {
      onEventClick(event)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Default event images if not provided
  const getEventImage = (event) => {
    return event.image || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop'
  }

  if (events.length === 0) {
    return (
      <section className="events-section">
        <h2 className="events-title">Upcoming Events</h2>
        <div className="no-events">
          <p>No upcoming events right now. Stay tuned for something epic! 🚀</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="events-section">
        <h2 className="events-title">Upcoming Events</h2>
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          navigation={true}
          pagination={{ clickable: true }}
          className="events-swiper"
        >
          {events.map((event) => (
            <SwiperSlide key={event._id || event.id}>
              <div className="event-card">
                <div className="event-card-image-wrapper">
                  <img 
                    src={getEventImage(event)} 
                    alt={event.name || 'Event'} 
                    className="event-card-image"
                  />
                  <div className="event-card-overlay"></div>
                </div>
                <div className="event-info">
                  <h3 className="event-card-title">{event.name || 'Untitled Event'}</h3>
                  {event.description && (
                    <p className="event-card-description">
                      {event.description.length > 100 
                        ? `${event.description.substring(0, 100)}...` 
                        : event.description}
                    </p>
                  )}
                  <div className="event-card-meta">
                    {event.location && (
                      <span className="event-meta-item">📍 {event.location}</span>
                    )}
                    {event.startDate && (
                      <span className="event-meta-item">📅 {formatDate(event.startDate)}</span>
                    )}
                  </div>
                  <button 
                    className="event-btn"
                    onClick={() => handleEventClick(event)}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  )
}

export default UpcomingEventsSection

