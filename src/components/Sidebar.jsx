import { FaThLarge, FaCalendarAlt, FaClipboardList, FaCheese, FaChartBar, FaCog } from 'react-icons/fa'
import './Sidebar.css'

function Sidebar({ activeSection, activeSubSection, setActiveSection, setActiveSubSection, user }) {
  const handleNavClick = (section, subSection = null) => {
    setActiveSection(section)
    if (subSection) {
      setActiveSubSection(subSection)
    } else {
      setActiveSubSection(null)
    }
  }

  const isActive = (section, subSection = null) => {
    if (subSection) {
      return activeSection === section && activeSubSection === subSection
    }
    return activeSection === section && !activeSubSection
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">D</div>
        </div>
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">DARIO</div>
          <div className="sidebar-brand-subtitle">Corzano e Paterno</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${isActive('dashboard') ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
        >
          <FaThLarge className="sidebar-icon" />
          <span>Dashboard</span>
        </button>

        <button
          className={`sidebar-item ${isActive('production', 'calendar') ? 'active' : ''}`}
          onClick={() => handleNavClick('production', 'calendar')}
        >
          <FaCalendarAlt className="sidebar-icon" />
          <span>Calendario</span>
        </button>

        <button
          className={`sidebar-item ${isActive('production', 'management') ? 'active' : ''}`}
          onClick={() => handleNavClick('production', 'management')}
        >
          <FaClipboardList className="sidebar-icon" />
          <span>Produzioni</span>
        </button>

        <button
          className={`sidebar-item ${isActive('cheese-types') ? 'active' : ''}`}
          onClick={() => handleNavClick('cheese-types')}
        >
          <FaCheese className="sidebar-icon" />
          <span>Formaggi</span>
        </button>

        <button
          className={`sidebar-item ${isActive('statistics') ? 'active' : ''}`}
          onClick={() => handleNavClick('statistics')}
        >
          <FaChartBar className="sidebar-icon" />
          <span>Statistiche</span>
        </button>

        <div className="sidebar-divider"></div>

        <button
          className={`sidebar-item ${isActive('settings') ? 'active' : ''}`}
          onClick={() => handleNavClick('settings')}
        >
          <FaCog className="sidebar-icon" />
          <span>Impostazioni</span>
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
