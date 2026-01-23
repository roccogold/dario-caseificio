import { CheeseType, Production, Activity } from "@/types"

const STORAGE_KEYS = {
  CHEESES: 'dario-cheeses',
  PRODUCTIONS: 'dario-productions',
  ACTIVITIES: 'dario-activities',
} as const

/**
 * Salva dati in localStorage
 */
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)
  }
}

/**
 * Carica dati da localStorage
 */
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    
    const parsed = JSON.parse(item)
    // Converti date strings in Date objects
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => {
        if (item.createdAt) item.createdAt = new Date(item.createdAt)
        if (item.date) item.date = new Date(item.date)
        return item
      }) as T
    }
    return parsed
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error)
    return defaultValue
  }
}

/**
 * Cheese Types - LocalStorage
 */
export const localCheeses = {
  load: (): CheeseType[] => {
    return loadFromStorage<CheeseType[]>(STORAGE_KEYS.CHEESES, [])
  },
  
  save: (cheeses: CheeseType[]): void => {
    saveToStorage(STORAGE_KEYS.CHEESES, cheeses)
  },
  
  add: (cheese: CheeseType): void => {
    const cheeses = localCheeses.load()
    cheeses.push(cheese)
    localCheeses.save(cheeses)
  },
  
  update: (id: string, updates: Partial<CheeseType>): void => {
    const cheeses = localCheeses.load()
    const index = cheeses.findIndex(c => c.id === id)
    if (index !== -1) {
      cheeses[index] = { ...cheeses[index], ...updates }
      localCheeses.save(cheeses)
    }
  },
  
  delete: (id: string): void => {
    const cheeses = localCheeses.load()
    const filtered = cheeses.filter(c => c.id !== id)
    localCheeses.save(filtered)
  },
}

/**
 * Productions - LocalStorage
 */
export const localProductions = {
  load: (): Production[] => {
    return loadFromStorage<Production[]>(STORAGE_KEYS.PRODUCTIONS, [])
  },
  
  save: (productions: Production[]): void => {
    saveToStorage(STORAGE_KEYS.PRODUCTIONS, productions)
  },
  
  add: (production: Production): void => {
    const productions = localProductions.load()
    productions.push(production)
    localProductions.save(productions)
  },
  
  update: (id: string, updates: Partial<Production>): void => {
    const productions = localProductions.load()
    const index = productions.findIndex(p => p.id === id)
    if (index !== -1) {
      const updated = { ...productions[index], ...updates }
      if (updates.cheeses) {
        updated.totalLiters = updates.cheeses.reduce((sum, c) => sum + c.liters, 0)
      }
      productions[index] = updated
      localProductions.save(productions)
    }
  },
  
  delete: (id: string): void => {
    const productions = localProductions.load()
    const filtered = productions.filter(p => p.id !== id)
    localProductions.save(filtered)
  },
}

/**
 * Activities - LocalStorage
 */
export const localActivities = {
  load: (): Activity[] => {
    return loadFromStorage<Activity[]>(STORAGE_KEYS.ACTIVITIES, [])
  },
  
  save: (activities: Activity[]): void => {
    saveToStorage(STORAGE_KEYS.ACTIVITIES, activities)
  },
  
  add: (activity: Activity): void => {
    const activities = localActivities.load()
    activities.push(activity)
    localActivities.save(activities)
  },
  
  update: (id: string, updates: Partial<Activity>): void => {
    const activities = localActivities.load()
    const index = activities.findIndex(a => a.id === id)
    if (index !== -1) {
      activities[index] = { ...activities[index], ...updates }
      localActivities.save(activities)
    }
  },
  
  delete: (id: string): void => {
    const activities = localActivities.load()
    const filtered = activities.filter(a => a.id !== id)
    localActivities.save(filtered)
  },
  
  toggle: (id: string): void => {
    const activities = localActivities.load()
    const index = activities.findIndex(a => a.id === id)
    if (index !== -1) {
      activities[index].completed = !activities[index].completed
      localActivities.save(activities)
    }
  },
  
  toggleDate: (id: string, dateStr: string): void => {
    const activities = localActivities.load()
    const index = activities.findIndex(a => a.id === id)
    if (index !== -1) {
      const activity = activities[index]
      const completedDates = activity.completedDates || []
      const dateIndex = completedDates.indexOf(dateStr)
      
      if (dateIndex > -1) {
        // Rimuovi la data
        completedDates.splice(dateIndex, 1)
      } else {
        // Aggiungi la data
        completedDates.push(dateStr)
      }
      
      activities[index] = { ...activity, completedDates }
      localActivities.save(activities)
    }
  },
}

/**
 * Pulisce tutti i dati da localStorage
 */
export function clearAllLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CHEESES)
    localStorage.removeItem(STORAGE_KEYS.PRODUCTIONS)
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES)
    console.log('✅ localStorage pulito')
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}
