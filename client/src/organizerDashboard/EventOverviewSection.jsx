import MetricCard from './MetricCard'
import './EventOverviewSection.css'

function EventOverviewSection() {
  const metrics = [
    {
      id: 1,
      title: 'Total Teams',
      value: '24',
      icon: '👥',
      color: '#9c27b0'
    },
    {
      id: 2,
      title: 'Ideas Submitted',
      value: '68',
      icon: '💡',
      color: '#8bc34a'
    },
    {
      id: 3,
      title: 'Total Votes',
      value: '342',
      icon: '🗳️',
      color: '#ff6b9d'
    },
    {
      id: 4,
      title: 'Capsules Created',
      value: '12',
      icon: '📦',
      color: '#ffc107'
    }
  ]

  return (
    <section className="event-overview-section">
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>
    </section>
  )
}

export default EventOverviewSection

