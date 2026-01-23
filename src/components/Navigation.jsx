import { useState, useEffect, useRef } from 'react'
import './Navigation.css'

function Navigation({ activeSection, activeSubSection, setActiveSection, setActiveSubSection }) {
  const [hoveredSection, setHoveredSection] = useState(null)
  const [touchedSection, setTouchedSection] = useState(null) // Per gestire tap su tablet
  const dropdownRef = useRef(null)

  // Chiudi dropdown quando clicchi fuori (utile su tablet)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (touchedSection && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTouchedSection(null)
      }
    }

    if (touchedSection) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [touchedSection])

  const handleProductionClick = () => {
    setActiveSection('production')
    if (activeSection !== 'production') {
      setActiveSubSection('calendar')
    }
    // Su tablet: toggle del dropdown al click
    if (hoveredSection === 'production' || touchedSection === 'production') {
      setHoveredSection(null)
      setTouchedSection(null)
    } else {
      setHoveredSection('production')
      setTouchedSection('production')
    }
  }

  const handleSubSectionClick = (subSection) => {
    setActiveSection('production') // Imposta sempre la sezione principale a 'production'
    setActiveSubSection(subSection)
    setHoveredSection(null) // Chiudi la tendina quando clicchi su una sottosezione
    setTouchedSection(null) // Chiudi anche su tablet
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div 
          className="nav-item-wrapper"
          ref={dropdownRef}
          onMouseEnter={() => {
            setHoveredSection('production')
            setTouchedSection(null) // Reset touch quando c'è hover (desktop)
          }}
          onMouseLeave={() => {
            setHoveredSection(null)
            // Non resettare touchedSection qui, altrimenti si chiude subito su tablet
          }}
        >
          <button
            className={`nav-main-item ${activeSection === 'production' ? 'active' : ''}`}
            onClick={handleProductionClick}
          >
            Produzione
          </button>
          {(hoveredSection === 'production' || touchedSection === 'production') && (
            <div className="nav-dropdown">
              <button
                className={`nav-dropdown-item ${activeSubSection === 'calendar' ? 'active' : ''}`}
                onClick={() => handleSubSectionClick('calendar')}
              >
                Calendario
              </button>
              <button
                className={`nav-dropdown-item ${activeSubSection === 'management' ? 'active' : ''}`}
                onClick={() => handleSubSectionClick('management')}
              >
                Storico
              </button>
            </div>
          )}
        </div>
        
        <button
          className={`nav-main-item ${activeSection === 'cheese-types' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('cheese-types')
            setActiveSubSection(null)
          }}
        >
          Gestione Formaggio
        </button>
        
        <button
          className={`nav-main-item ${activeSection === 'statistics' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('statistics')
            setActiveSubSection(null)
          }}
        >
          Statistiche
        </button>
      </div>
    </nav>
  )
}

export default Navigation
