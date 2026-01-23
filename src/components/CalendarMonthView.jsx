import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns'
import it from 'date-fns/locale/it'
import { formatDateCapitalized } from '../utils/dateFormat'
import './CalendarViews.css'

function CalendarMonthView({ date, activities, productions, cheeses, selectedDate, onDateClick, getActivitiesForDate }) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { locale: it })
  const calendarEnd = endOfWeek(monthEnd, { locale: it })
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

  const handleDayClick = (day) => {
    onDateClick(day)
  }

  const getActivityPreview = (activity) => {
    if (activity.type === 'production') {
      // For production activities, show cheese name and liters if available
      const parts = activity.title?.split(' - ') || []
      if (parts.length > 1) {
        return parts[1] // Usually the cheese name and activity
      }
      return activity.title || activity.description || 'Produzione'
    }
    return activity.title || activity.description || 'Attività'
  }

  return (
    <div className="calendar-month-view">
      <div className="month-grid">
        <div className="month-week-header">
          {dayNames.map((dayName, index) => (
            <div key={index} className="month-day-name">{dayName}</div>
          ))}
        </div>
        
        <div className="month-days">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, date)
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const dayActivities = getActivitiesForDate(day)
            
            return (
              <div
                key={index}
                className={`month-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <div className="month-day-number">{format(day, 'd')}</div>
                {dayActivities.length > 0 && (
                  <div className="month-activity-dots">
                    {dayActivities.map((activity, actIndex) => {
                      const dotColor = activity.type === 'production' && activity.cheeseColor 
                        ? activity.cheeseColor 
                        : '#22c55e' // Verde di default per attività normali
                      return (
                        <span
                          key={activity.id || actIndex}
                          className="month-activity-dot"
                          style={{ backgroundColor: dotColor }}
                          title={activity.title || activity.description}
                        ></span>
                      )
                    })}
                  </div>
                )}
                {dayActivities.length === 0 && isCurrentMonth && (
                  <div className="month-no-activities">Nessuna attività</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CalendarMonthView
