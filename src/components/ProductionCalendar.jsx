import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subDays, isSameDay, isSameMonth, differenceInDays } from 'date-fns'
import it from 'date-fns/locale/it'
import { formatDateCapitalized } from '../utils/dateFormat'
import ProductionModal from './ProductionModal'
import ActivityModal from './ActivityModal'
import CalendarDayView from './CalendarDayView'
import CalendarMonthView from './CalendarMonthView'
import CalendarDaySidebar from './CalendarDaySidebar'
import ConfirmDialog from './ConfirmDialog'
import './ProductionCalendar.css'

function ProductionCalendar({ 
  cheeses, 
  productions, 
  onSaveProduction,
  onDeleteProduction,
  activities, 
  onSaveActivity,
  onDeleteActivity,
  completedActivities, 
  onToggleActivityCompleted
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState('month')
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [editingProduction, setEditingProduction] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  
  const toggleActivityCompleted = async (activityId, activityDate) => {
    const date = activityDate || format(new Date(), 'yyyy-MM-dd')
    // Trova l'attività per vedere se è di tipo production o normale
    const activity = activities.find(a => a.id === activityId) || 
                     getActivitiesForDate(currentDate).find(a => a.id === activityId)
    
    if (activity && activity.type === 'production') {
      // Per attività produzione usa la chiave
      const key = `${activityId}-${date}`
      const isCompleted = completedActivities[key] || false
      await onToggleActivityCompleted(activityId, date, !isCompleted)
    } else {
      // Per attività normali usa is_completed direttamente
      const isCompleted = activity?.isCompleted || false
      await onToggleActivityCompleted(activityId, date, !isCompleted)
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const navigateDate = (direction) => {
    if (view === 'day') {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1))
      setSelectedDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1))
    } else if (view === 'month') {
      const newDate = direction === 'next' 
        ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      setCurrentDate(newDate)
    }
  }

  const getActivitiesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // Get activities for this specific date, considering recurrence
    const dateActivities = activities.filter(a => {
      if (!a.date) return false
      
      // Parse activity date
      const [year, month, day] = a.date.split('-').map(Number)
      const activityDate = new Date(year, month - 1, day)
      
      // If no recurrence, show only on the exact date
      if (!a.recurrence || a.recurrence === 'none') {
        return a.date === dateStr
      }
      
      // For recurring activities, check if they should appear on this date
      const daysDiff = differenceInDays(date, activityDate)
      
      switch (a.recurrence) {
        case 'daily':
          // Show every day from the activity date onwards
          return daysDiff >= 0
        
        case 'weekly':
          // Show every 7 days
          return daysDiff >= 0 && daysDiff % 7 === 0
        
        case 'monthly':
          // Show on the same day of each month
          return daysDiff >= 0 && date.getDate() === activityDate.getDate()
        
        case 'quarterly':
          // Show every 3 months on the same day
          if (daysDiff < 0) return false
          const monthsDiff = (date.getFullYear() - activityDate.getFullYear()) * 12 + 
                            (date.getMonth() - activityDate.getMonth())
          return monthsDiff >= 0 && monthsDiff % 3 === 0 && date.getDate() === activityDate.getDate()
        
        case 'semiannual':
          // Show every 6 months on the same day
          if (daysDiff < 0) return false
          const semiannualMonthsDiff = (date.getFullYear() - activityDate.getFullYear()) * 12 + 
                                      (date.getMonth() - activityDate.getMonth())
          return semiannualMonthsDiff >= 0 && semiannualMonthsDiff % 6 === 0 && date.getDate() === activityDate.getDate()
        
        case 'yearly':
          // Show on the same date each year
          return daysDiff >= 0 && date.getMonth() === activityDate.getMonth() && date.getDate() === activityDate.getDate()
        
        default:
          // Fallback: show only on exact date
          return a.date === dateStr
      }
    })
    
    // Get production tasks for this date
    const productionTasks = productions.flatMap(production => {
      if (!production || !production.productionDate) {
        return []
      }
      
      // Parse production date as local date (yyyy-MM-dd format)
      // Split and create date in local timezone to avoid UTC conversion
      let productionDate
      if (typeof production.productionDate === 'string') {
        const [year, month, day] = production.productionDate.split('-').map(Number)
        // Create date in local timezone (month is 0-indexed)
        productionDate = new Date(year, month - 1, day)
      } else {
        // If it's already a Date object, create a new one from its components
        const d = new Date(production.productionDate)
        productionDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      }
      
      const tasks = []
      
      if (production.cheeses && Array.isArray(production.cheeses)) {
        production.cheeses.forEach(cheeseProd => {
          if (!cheeseProd || !cheeseProd.cheeseId) return
          
          const cheese = cheeses.find(c => c.id === cheeseProd.cheeseId)
          if (cheese && cheese.protocol && Array.isArray(cheese.protocol)) {
            cheese.protocol.forEach(step => {
              if (!step || step.day === undefined) return
              
              // Add days to production date
              const taskDate = addDays(productionDate, step.day)
              
              // Compare dates using string format (yyyy-MM-dd) to avoid timezone issues
              const taskDateStr = format(taskDate, 'yyyy-MM-dd')
              const compareDateStr = format(date, 'yyyy-MM-dd')
              
              if (taskDateStr === compareDateStr) {
                tasks.push({
                  id: `${production.id}-${cheeseProd.cheeseId}-${step.day}`,
                  type: 'production',
                  title: `${cheese.name} - ${step.activity}`,
                  productionNumber: production.productionNumber,
                  liters: cheeseProd.liters,
                  description: `Produzione #${production.productionNumber} - ${cheese.name} (${cheeseProd.liters}L)`,
                  cheeseId: cheeseProd.cheeseId,
                  cheeseColor: cheese.color || '#FFD700'
                })
              }
            })
          }
        })
      }
      
      return tasks
    })
    
    return [...dateActivities, ...productionTasks]
  }

  const handleDateClick = (day) => {
    setSelectedDate(day)
    if (view === 'month') {
      // Nella vista mensile, seleziona il giorno ma resta in vista mensile
      // La sidebar destra mostrerà i dettagli
    } else {
      setCurrentDate(day)
      setView('day')
    }
  }

  return (
    <div className="production-calendar">
      <div className="calendar-header">
        <div className="calendar-header-left">
          <h2 className="calendar-title">Calendario</h2>
          <p className="calendar-subtitle">Gestisci produzioni e attività</p>
        </div>
        <div className="calendar-header-right">
          <button
            className="new-production-button"
            onClick={() => {
              setEditingProduction(null)
              setIsProductionModalOpen(true)
            }}
          >
            + Nuova Produzione
          </button>
        </div>
      </div>

      <div className="calendar-view-controls">
        <div className="month-navigation">
          <h3 className="current-month">
            {format(currentDate, "MMMM yyyy", { locale: it })}
          </h3>
          <div className="month-navigation-right">
            <button className="nav-button" onClick={() => navigateDate('prev')}>
              &lt;
            </button>
            <button className="today-button" onClick={goToToday}>
              Oggi
            </button>
            <button className="nav-button" onClick={() => navigateDate('next')}>
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-main-content">
        <div className={`calendar-content ${view === 'month' ? 'with-sidebar' : ''}`}>
        {view === 'day' ? (
          <CalendarDayView
            date={currentDate}
            activities={getActivitiesForDate(currentDate)}
            completedActivities={completedActivities}
            onToggleCompleted={(activityId, dateStr, isCompleted) => {
              onToggleActivityCompleted(activityId, dateStr, isCompleted)
            }}
            onDateClick={setCurrentDate}
            onEditActivity={(activity) => {
              setEditingActivity(activity)
              setIsActivityModalOpen(true)
            }}
            onDeleteActivity={(activityId) => {
              setConfirmDialog({
                title: 'Elimina Attività',
                message: 'Sei sicuro di voler eliminare questa attività?',
                onConfirm: async () => {
                  try {
                    await onDeleteActivity(activityId)
                    setConfirmDialog(null)
                  } catch (error) {
                    console.error('Error deleting activity:', error)
                    setConfirmDialog(null)
                  }
                },
                onCancel: () => setConfirmDialog(null)
              })
            }}
          />
        ) : (
          <>
            <CalendarMonthView
              date={currentDate}
              activities={activities}
              productions={productions}
              cheeses={cheeses}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              getActivitiesForDate={getActivitiesForDate}
            />
            {view === 'month' && (
              <CalendarDaySidebar
                date={selectedDate}
                productions={productions}
                activities={activities}
                cheeses={cheeses}
                completedActivities={completedActivities}
                onToggleActivityCompleted={onToggleActivityCompleted}
                getActivitiesForDate={getActivitiesForDate}
                onAddProduction={() => {
                  setEditingProduction(null)
                  setIsProductionModalOpen(true)
                }}
                onAddActivity={() => {
                  setEditingActivity(null)
                  setIsActivityModalOpen(true)
                }}
              />
            )}
          </>
        )}
        </div>

      </div>

      {isProductionModalOpen && (
        <ProductionModal
          cheeses={cheeses}
          production={editingProduction}
          productions={productions}
          onSave={async (productionData) => {
            try {
              const productionToSave = editingProduction
                ? { ...productionData, id: editingProduction.id }
                : { ...productionData, id: `temp-${Date.now()}` }
              
              await onSaveProduction(productionToSave)
              setIsProductionModalOpen(false)
              setEditingProduction(null)
            } catch (error) {
              console.error('Error saving production:', error)
            }
          }}
          onClose={() => {
            setIsProductionModalOpen(false)
            setEditingProduction(null)
          }}
        />
      )}

      {isActivityModalOpen && (
        <ActivityModal
          initialDate={currentDate}
          activity={editingActivity}
          onSave={async (activityData) => {
            try {
              const activityToSave = editingActivity
                ? { ...activityData, id: editingActivity.id }
                : { ...activityData, id: `temp-${Date.now()}` }
              
              await onSaveActivity(activityToSave)
              setIsActivityModalOpen(false)
              setEditingActivity(null)
            } catch (error) {
              console.error('Error saving activity:', error)
            }
          }}
          onClose={() => {
            setIsActivityModalOpen(false)
            setEditingActivity(null)
          }}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText || 'Elimina'}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
          type="danger"
        />
      )}
    </div>
  )
}

export default ProductionCalendar
