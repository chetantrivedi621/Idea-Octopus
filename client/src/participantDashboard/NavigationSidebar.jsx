import { useState } from 'react'
import './NavigationSidebar.css'

function NavigationSidebar({ isOpen, onClose }) {
  const [activeItem, setActiveItem] = useState('Dashboard')

  const menuItems = [
    { id: 'Dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'My Ideas', icon: '❓', label: 'My Ideas' },
    { id: 'Capsules', icon: '💊', label: 'Capsules' },
    { id: 'Leaderboard', icon: '🏆', label: 'Leaderboard' },
    { id: 'Profile', icon: '👤', label: 'Profile' },
  ]

  if (!isOpen) return null

  return (
    <aside className="navigation-sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Navigation</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => setActiveItem(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default NavigationSidebar

