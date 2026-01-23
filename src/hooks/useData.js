import { useState, useMemo } from 'react'
import { 
  startOfMonth, 
  endOfMonth, 
  format, 
  isSameDay, 
  isSameMonth, 
  getMonth, 
  getYear,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  parseISO
} from 'date-fns'
import { mockCheeseTypes, mockProductions, mockActivities } from '../utils/mockData'

// This hook manages all data - will be replaced with Supabase later
export function useData() {
  const [cheeseTypes, setCheeseTypes] = useState(mockCheeseTypes)
  const [productions, setProductions] = useState(mockProductions)
  const [activities, setActivities] = useState(mockActivities)
  const [isLoading, setIsLoading] = useState(false)

  // Cheese type operations
  const addCheeseType = (cheese) => {
    const newCheese = {
      ...cheese,
      id: `cheese-${Date.now()}`,
    }
    setCheeseTypes((prev) => [...prev, newCheese])
    return newCheese
  }

  const updateCheeseType = (id, updates) => {
    setCheeseTypes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }

  const deleteCheeseType = (id) => {
    setCheeseTypes((prev) => prev.filter((c) => c.id !== id))
  }

  // Production operations
  const addProduction = (production) => {
    const totalLiters = production.cheeses.reduce((sum, c) => sum + (parseInt(c.liters) || 0), 0)
    const newProduction = {
      ...production,
      id: `prod-${Date.now()}`,
      totalLiters,
      productionDate: production.productionDate || format(new Date(), 'yyyy-MM-dd'),
    }
    setProductions((prev) => [...prev, newProduction])
    return newProduction
  }

  const updateProduction = (id, updates) => {
    setProductions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates }
          if (updates.cheeses) {
            updated.totalLiters = updates.cheeses.reduce((sum, c) => sum + (parseInt(c.liters) || 0), 0)
          }
          return updated
        }
        return p
      })
    )
  }

  const deleteProduction = (id) => {
    setProductions((prev) => prev.filter((p) => p.id !== id))
  }

  // Activity operations
  const addActivity = (activity) => {
    const newActivity = {
      ...activity,
      id: `act-${Date.now()}`,
      date: activity.date || format(new Date(), 'yyyy-MM-dd'),
      recurrence: activity.recurrence || 'none',
      isCompleted: activity.isCompleted || false,
    }
    setActivities((prev) => [...prev, newActivity])
    return newActivity
  }

  const toggleActivity = (id, dateStr = null) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, isCompleted: !a.isCompleted }
        }
        return a
      })
    )
  }

  const deleteActivity = (id) => {
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  // Get activities for a specific date (handles recurring activities)
  const getActivitiesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const targetDate = typeof date === 'string' ? parseISO(date) : date
    
    return activities.filter((a) => {
      if (!a.date) return false
      
      const activityDate = parseISO(a.date)
      
      // One-time activities
      if (!a.recurrence || a.recurrence === 'none') {
        return isSameDay(activityDate, targetDate)
      }
      
      // Recurring activities
      if (targetDate < activityDate) return false
      
      if (a.recurrence === 'daily') {
        return true // Show all days after start date
      }
      
      if (a.recurrence === 'weekly') {
        const daysDiff = Math.floor((targetDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff >= 0 && daysDiff % 7 === 0
      }
      
      if (a.recurrence === 'monthly') {
        return targetDate.getDate() === activityDate.getDate()
      }
      
      if (a.recurrence === 'yearly') {
        return targetDate.getMonth() === activityDate.getMonth() && 
               targetDate.getDate() === activityDate.getDate()
      }
      
      return false
    })
  }

  // Get productions for a specific date
  const getProductionsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return productions.filter((p) => p.productionDate === dateStr)
  }

  // Get productions for a month
  const getProductionsForMonth = (date) => {
    return productions.filter((p) => {
      if (!p.productionDate) return false
      const prodDate = parseISO(p.productionDate)
      return isSameMonth(prodDate, date)
    })
  }

  // Calculate monthly stats
  const getMonthlyStats = (year) => {
    const yearStart = startOfYear(new Date(year, 0, 1))
    const yearEnd = endOfYear(new Date(year, 0, 1))
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

    return months.map((monthDate) => {
      const monthProductions = productions.filter((p) => {
        if (!p.productionDate) return false
        const prodDate = parseISO(p.productionDate)
        return getMonth(prodDate) === getMonth(monthDate) && 
               getYear(prodDate) === year
      })

      const cheeseBreakdown = cheeseTypes.map((cheese) => ({
        cheeseTypeId: cheese.id,
        liters: monthProductions.reduce((sum, prod) => {
          const cheeseProd = prod.cheeses?.find((c) => c.cheeseId === cheese.id)
          return sum + (parseInt(cheeseProd?.liters) || 0)
        }, 0),
      })).filter(c => c.liters > 0)

      return {
        month: getMonth(monthDate),
        year,
        totalLiters: monthProductions.reduce((sum, p) => sum + (parseInt(p.totalLiters) || 0), 0),
        productions: monthProductions.length,
        cheeseBreakdown,
      }
    })
  }

  // Get cheese type by ID
  const getCheeseType = (id) => {
    return cheeseTypes.find((c) => c.id === id)
  }

  return {
    // Data
    cheeseTypes,
    productions,
    activities,
    isLoading,

    // Cheese operations
    addCheeseType,
    updateCheeseType,
    deleteCheeseType,
    getCheeseType,

    // Production operations
    addProduction,
    updateProduction,
    deleteProduction,
    getProductionsForDate,
    getProductionsForMonth,

    // Activity operations
    addActivity,
    toggleActivity,
    deleteActivity,
    getActivitiesForDate,

    // Stats
    getMonthlyStats,
  }
}
