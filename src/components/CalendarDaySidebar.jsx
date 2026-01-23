import { format } from 'date-fns'
import it from 'date-fns/locale/it'
import { formatDateCapitalized } from '../utils/dateFormat'
import { FaIndustry, FaCheckCircle, FaClock, FaFileAlt } from 'react-icons/fa'
import './CalendarDaySidebar.css'

function CalendarDaySidebar({ 
  date, 
  productions, 
  activities, 
  cheeses,
  completedActivities,
  onToggleActivityCompleted,
  getActivitiesForDate,
  onAddProduction,
  onAddActivity
}) {
  const dateStr = format(date, 'yyyy-MM-dd')
  
  // Filtra produzioni per la data
  const dayProductions = productions.filter(prod => {
    if (!prod.productionDate) return false
    return prod.productionDate === dateStr
  })

  // Usa la funzione getActivitiesForDate passata come prop
  const dayActivities = getActivitiesForDate ? getActivitiesForDate(date) : []

  const getCheeseName = (cheeseId) => {
    const cheese = cheeses.find(c => c.id === cheeseId)
    return cheese ? cheese.name : 'Formaggio sconosciuto'
  }

  const getCheeseColor = (cheeseId) => {
    const cheese = cheeses.find(c => c.id === cheeseId)
    return cheese ? cheese.color : '#FFD700'
  }

  const isActivityCompleted = (activity) => {
    if (activity.type === 'production') {
      const key = `${activity.id}-${dateStr}`
      return completedActivities[key] || false
    }
    return activity.isCompleted || false
  }

  return (
    <aside className="calendar-day-sidebar">
      <div className="sidebar-header">
        <h3>{formatDateCapitalized(date, "EEEE d MMMM")}</h3>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <FaIndustry className="section-icon" />
          <span>Produzioni</span>
        </div>
        {dayProductions.length === 0 ? (
          <p className="empty-message">Nessuna produzione</p>
        ) : (
          <div className="productions-list">
            {dayProductions.map(prod => (
              <div key={prod.id} className="production-card">
                <div className="production-header">
                  <span className="production-id">#{prod.productionNumber || prod.id}</span>
                  <span className="production-liters">{String(prod.totalLiters || 0).replace(/^0+/, '') || '0'} L</span>
                </div>
                {prod.cheeses && prod.cheeses.length > 0 && (
                  <div className="production-cheeses">
                    {prod.cheeses.map((cheese, idx) => (
                      <span 
                        key={idx} 
                        className="cheese-tag"
                        style={{ backgroundColor: getCheeseColor(cheese.cheeseId) }}
                      >
                        {getCheeseName(cheese.cheeseId)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <FaCheckCircle className="section-icon" />
          <span>Attività ({dayActivities.length})</span>
        </div>
        {dayActivities.length === 0 ? (
          <p className="empty-message">Nessuna attività per questo giorno</p>
        ) : (
          <div className="activities-list">
            {dayActivities.map(activity => {
              const isCompleted = isActivityCompleted(activity)
              const isRecurring = activity.recurrence && activity.recurrence !== 'none'
              const isProduction = activity.type === 'production'
              
              return (
                <div 
                  key={activity.id} 
                  className={`activity-card ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="activity-radio-wrapper">
                    <input
                      type="radio"
                      className="activity-radio"
                      checked={isCompleted}
                      onChange={() => {
                        onToggleActivityCompleted(activity.id, dateStr, !isCompleted)
                      }}
                    />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title || activity.description}</div>
                    {activity.description && activity.title && (
                      <div className="activity-description">{activity.description}</div>
                    )}
                    <div className="activity-meta">
                      {isRecurring && (
                        <span className="meta-badge">
                          {activity.recurrence === 'daily' ? 'Giornaliero' : 
                           activity.recurrence === 'weekly' ? 'Settimanale' : 
                           activity.recurrence === 'monthly' ? 'Mensile' : 'Ricorrente'}
                        </span>
                      )}
                      {isProduction && (
                        <span className="meta-badge">
                          <FaFileAlt className="meta-badge-icon" />
                          Protocollo
                        </span>
                      )}
                      {!isCompleted && (
                        <span className="meta-badge pending">
                          <FaClock className="meta-badge-icon" />
                          In sospeso
                        </span>
                      )}
                    </div>
                  </div>
                  {isProduction && (
                    <div 
                      className="activity-color-dot"
                      style={{ backgroundColor: getCheeseColor(activity.cheeseId) }}
                    ></div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="sidebar-actions">
        <button className="sidebar-action-button" onClick={onAddProduction}>
          <span>+</span> <span>Produzione</span>
        </button>
        <button className="sidebar-action-button" onClick={onAddActivity}>
          <span>+</span> <span>Attività</span>
        </button>
      </div>
    </aside>
  )
}

export default CalendarDaySidebar
