import { formatDateCapitalized } from '../utils/dateFormat'
import { EditIcon, DeleteIcon } from './Icons'
import './Icons.css'
import './CalendarViews.css'

import { format } from 'date-fns'

function CalendarDayView({ date, activities, completedActivities, onToggleCompleted, onEditActivity, onDeleteActivity }) {
  const dateStr = format(date, 'yyyy-MM-dd')
  
  return (
    <div className="calendar-day-view">
      <h3 className="view-title">
        Attività per {formatDateCapitalized(date, "EEEE d MMMM yyyy")}
      </h3>
      
      {activities.length === 0 ? (
        <div className="empty-calendar-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="28" stroke="#d4c5b0" strokeWidth="2" fill="none" opacity="0.4"/>
              <line x1="32" y1="32" x2="32" y2="20" stroke="#8b7355" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
              <line x1="32" y1="32" x2="40" y2="32" stroke="#8b7355" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <p>Nessuna attività programmata per questo giorno</p>
          <p className="empty-hint">
            Clicca "Aggiungi Attività" per creare una nuova attività o programmare la produzione di formaggio
          </p>
        </div>
      ) : (
        <div className="activities-list">
          {activities.map((activity, index) => {
            // Per attività ricorrenti (non solo produzione), usa completedActivities con chiave data-specifica
            // Per attività non ricorrenti, usa isCompleted dal DB
            const isRecurring = activity.recurrence && activity.recurrence !== 'none'
            const isCompleted = activity.type === 'production' || isRecurring
              ? (completedActivities[`${activity.id}-${dateStr}`] || false)
              : (activity.isCompleted || false)
            return (
              <div 
                key={activity.id || index} 
                className={`activity-item ${isCompleted ? 'completed' : ''}`}
                style={activity.type === 'production' && activity.cheeseColor ? {
                  borderLeftColor: activity.cheeseColor
                } : {}}
              >
                <div className="activity-checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="activity-checkbox"
                    checked={isCompleted}
                    onChange={() => onToggleCompleted(activity.id, dateStr, !isCompleted)}
                    title={isCompleted ? 'Segna come non completata' : 'Segna come completata'}
                  />
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <h4>{activity.title || activity.description}</h4>
                    <div className="activity-header-actions">
                      {activity.type === 'production' && (
                        <span className="production-badge">Produzione</span>
                      )}
                      {activity.type === 'activity' && onEditActivity && (
                        <>
                          <button
                            className="icon-button edit"
                            onClick={() => onEditActivity(activity)}
                            title="Modifica"
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="icon-button delete"
                            onClick={() => onDeleteActivity(activity.id)}
                            title="Elimina"
                          >
                            <DeleteIcon />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {activity.description && (
                    <p className="activity-description">{activity.description}</p>
                  )}
                  {activity.liters && (
                    <p className="activity-meta">Litri: {activity.liters}L</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CalendarDayView
