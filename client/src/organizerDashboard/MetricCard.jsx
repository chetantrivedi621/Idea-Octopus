import './MetricCard.css'

function MetricCard({ title, value, icon, color }) {
  return (
    <div className="metric-card" style={{ backgroundColor: color }}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-title">{title}</div>
      </div>
    </div>
  )
}

export default MetricCard

