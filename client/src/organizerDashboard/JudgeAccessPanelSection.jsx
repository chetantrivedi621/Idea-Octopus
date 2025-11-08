import JudgeCard from './JudgeCard'
import './JudgeAccessPanelSection.css'

function JudgeAccessPanelSection() {
  const judges = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      email: 'sarah@example.com',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Prof. James Wilson',
      email: 'james@example.com',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Maya Patel',
      email: 'maya@example.com',
      status: 'Pending'
    }
  ]

  return (
    <section className="judge-access-panel-section">
      <div className="section-header">
        <h2 className="section-title">Judge Access Panel</h2>
        <button className="add-judge-button">
          <span>+</span>
          Add Judge
        </button>
      </div>
      <div className="judges-list">
        {judges.map((judge) => (
          <JudgeCard
            key={judge.id}
            name={judge.name}
            email={judge.email}
            status={judge.status}
          />
        ))}
      </div>
    </section>
  )
}

export default JudgeAccessPanelSection

