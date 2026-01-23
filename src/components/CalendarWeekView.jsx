import { format, addDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import it from 'date-fns/locale/it'
import './CalendarViews.css'

function CalendarWeekView({ startDate, activities, productions, cheeses, onDateClick, getActivitiesForDate }) {
  const weekDays = []
  const weekStart = startOfWeek(startDate, { locale: it })
  const weekEnd = endOfWeek(startDate, { locale: it })
  
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i))
  }

  const handleActivityClick = (day, e) => {
    e.stopPropagation()
    onDateClick(day)
  }

  return (
    <div className="calendar-week-view">
      <div className="week-header">
        {weekDays.map((day, index) => (
          <div 
            key={index} 
            className="week-day-header"
            onClick={() => onDateClick(day)}
            style={{ cursor: 'pointer' }}
          >
            <div className="week-day-name">{format(day, 'EEE', { locale: it })}</div>
            <div className={`week-day-number ${isSameDay(day, new Date()) ? 'today' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      <div className="week-grid">
        {weekDays.map((day, index) => {
          const dayActivities = getActivitiesForDate(day)
          return (
            <div 
              key={index} 
              className="week-day-cell"
              onClick={() => onDateClick(day)}
              style={{ cursor: 'pointer' }}
            >
              {dayActivities.map((activity, actIndex) => (
                <div 
                  key={activity.id || actIndex} 
                  className="week-activity-item"
                  onClick={(e) => handleActivityClick(day, e)}
                  style={activity.type === 'production' && activity.cheeseColor ? {
                    borderLeftColor: activity.cheeseColor
                  } : {}}
                >
                  <div className="activity-title">{activity.title || activity.description}</div>
                  {activity.type === 'production' && (
                    <span 
                      className="production-badge-small"
                      style={activity.cheeseColor ? {
                        backgroundColor: activity.cheeseColor,
                        color: 'white'
                      } : {}}
                    >
                      P
                    </span>
                  )}
                </div>
              ))}
              {dayActivities.length === 0 && (
                <div className="week-empty">Nessuna attività</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarWeekView
