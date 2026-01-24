import { supabase } from './supabase'
import { typeCheeseToDb, dbCheeseToType } from '@/lib/adapters'

/**
 * Ottiene l'IP dell'utente (semplificato - in produzione usa un servizio esterno)
 */
async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    return 'unknown'
  }
}

/**
 * Log di un'azione
 */
export async function logAction(action, entityType, entityId = null, details = {}) {
  if (!supabase) {
    return // Skip logging if Supabase is not configured
  }
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const username = user?.email || 'anonymous'
    const ip = await getUserIP()
    const userAgent = navigator.userAgent

    const { error } = await supabase.from('logs').insert({
      username,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ip,
      user_agent: userAgent,
      details
    })

    if (error) {
      console.error('Error logging action:', error)
    }
  } catch (error) {
    console.error('Error in logAction:', error)
  }
}

/**
 * Carica tutti i formaggi dal database
 */
export async function loadCheeses() {
  if (!supabase) {
    return []
  }
  try {
    const { data, error } = await supabase
      .from('formaggi')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    // Usa l'adapter per convertire dal formato DB al formato TypeScript
    return (data || []).map(dbCheeseToType)
  } catch (error) {
    console.error('Error loading cheeses:', error)
    return []
  }
}

/**
 * Salva un formaggio (create o update)
 */
export async function saveCheese(cheese) {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    // Usa l'adapter per convertire dal formato TypeScript al formato DB
    const dbData = typeCheeseToDb(cheese)
    
    // Debug logging (only in development)
    if (import.meta.env.DEV) {
      console.log('[saveCheese] Input cheese:', {
        name: cheese.name,
        hasDefaultFields: !!cheese.defaultFields,
        defaultFieldsKeys: cheese.defaultFields ? Object.keys(cheese.defaultFields) : [],
        defaultFields: cheese.defaultFields
      })
      console.log('[saveCheese] Converted dbData:', {
        name: dbData.name,
        default_fields: dbData.default_fields
      })
    }
    
    if (!cheese.id || cheese.id.startsWith('temp-') || typeof cheese.id === 'number') {
      // Nuovo formaggio - rimuovi l'ID se è temporaneo
      const insertData = { ...dbData }
      if (cheese.id && (cheese.id.startsWith('temp-') || typeof cheese.id === 'number')) {
        delete insertData.id
      }
      
      const { data, error } = await supabase
        .from('formaggi')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      await logAction('create', 'formaggio', data.id, { name: cheese.name })
      return dbCheeseToType(data)
    } else {
      // Update formaggio esistente
      const { data, error } = await supabase
        .from('formaggi')
        .update(dbData)
        .eq('id', cheese.id)
        .select()
        .single()

      if (error) throw error

      await logAction('update', 'formaggio', cheese.id, { name: cheese.name })
      return dbCheeseToType(data)
    }
  } catch (error) {
    console.error('Error saving cheese:', error)
    throw error
  }
}

/**
 * Elimina un formaggio
 */
export async function deleteCheese(cheeseId) {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    const { error } = await supabase
      .from('formaggi')
      .delete()
      .eq('id', cheeseId)

    if (error) throw error

    await logAction('delete', 'formaggio', cheeseId)
  } catch (error) {
    console.error('Error deleting cheese:', error)
    throw error
  }
}

/**
 * Carica tutte le produzioni dal database
 */
export async function loadProductions() {
  if (!supabase) {
    return []
  }
  try {
    const { data, error } = await supabase
      .from('produzioni')
      .select('*')
      .order('production_date', { ascending: false })

    if (error) throw error

    return (data || []).map(prod => ({
      id: prod.id,
      productionNumber: prod.production_number,
      date: prod.production_date ? new Date(prod.production_date) : new Date(),
      totalLiters: prod.total_liters || 0,
      cheeses: prod.cheeses || [],
      notes: prod.notes || '',
      createdAt: prod.created_at ? new Date(prod.created_at) : new Date()
    }))
  } catch (error) {
    console.error('Error loading productions:', error)
    return []
  }
}

/**
 * Salva una produzione (create o update)
 */
export async function saveProduction(production) {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    if (!production.id || production.id.startsWith('temp-') || typeof production.id === 'number') {
      // Nuova produzione
      const { data, error } = await supabase
        .from('produzioni')
        .insert({
          production_number: production.productionNumber,
          production_date: production.date ? (production.date instanceof Date ? production.date.toISOString().split('T')[0] : production.date) : new Date().toISOString().split('T')[0],
          total_liters: production.totalLiters || 0,
          cheeses: production.cheeses || [],
          notes: production.notes || ''
        })
        .select()
        .single()

      if (error) throw error

      await logAction('create', 'produzione', data.id, { 
        production_number: production.productionNumber 
      })
      return { id: data.id, ...production }
    } else {
      // Update produzione esistente
      const { data, error } = await supabase
        .from('produzioni')
        .update({
          production_number: production.productionNumber,
          production_date: production.date ? (production.date instanceof Date ? production.date.toISOString().split('T')[0] : production.date) : new Date().toISOString().split('T')[0],
          total_liters: production.totalLiters || 0,
          cheeses: production.cheeses || [],
          notes: production.notes || ''
        })
        .eq('id', production.id)
        .select()
        .single()

      if (error) throw error

      await logAction('update', 'produzione', production.id, { 
        production_number: production.productionNumber 
      })
      return data
    }
  } catch (error) {
    console.error('Error saving production:', error)
    throw error
  }
}

/**
 * Elimina una produzione
 */
export async function deleteProduction(productionId) {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    const { error } = await supabase
      .from('produzioni')
      .delete()
      .eq('id', productionId)

    if (error) throw error

    await logAction('delete', 'produzione', productionId)
  } catch (error) {
    console.error('Error deleting production:', error)
    throw error
  }
}

/**
 * Carica tutte le attività dal database
 */
export async function loadActivities() {
  if (!supabase) {
    return []
  }
  try {
    const { data, error } = await supabase
      .from('attività')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    return (data || []).map(activity => ({
      id: activity.id,
      date: activity.date ? new Date(activity.date) : new Date(),
      title: activity.title,
      description: activity.description || '',
      type: activity.type || 'one-time',
      recurrence: activity.recurrence || undefined,
      productionId: activity.production_id || undefined,
      cheeseTypeId: activity.cheese_type_id || undefined,
      completed: activity.is_completed || false,
      completedDates: activity.completed_dates || [],
      createdAt: activity.created_at ? new Date(activity.created_at) : new Date()
    }))
  } catch (error) {
    console.error('Error loading activities:', error)
    return []
  }
}

/**
 * Salva un'attività (create o update)
 */
export async function saveActivity(activity) {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    if (!activity.id || activity.id.startsWith('temp-') || typeof activity.id === 'number') {
      // Nuova attività
      const { data, error } = await supabase
        .from('attività')
        .insert({
          date: activity.date ? (activity.date instanceof Date ? activity.date.toISOString().split('T')[0] : activity.date) : new Date().toISOString().split('T')[0],
          title: activity.title,
          description: activity.description || '',
          type: activity.type || 'one-time',
          recurrence: activity.recurrence || null,
          production_id: activity.productionId || null,
          cheese_type_id: activity.cheeseTypeId || null,
          is_completed: activity.completed || false,
          completed_dates: activity.completedDates || []
        })
        .select()
        .single()

      if (error) throw error

      await logAction('create', 'attività', data.id, { title: activity.title })
      return { id: data.id, ...activity }
    } else {
      // Update attività esistente
      const { data, error } = await supabase
        .from('attività')
        .update({
          date: activity.date ? (activity.date instanceof Date ? activity.date.toISOString().split('T')[0] : activity.date) : new Date().toISOString().split('T')[0],
          title: activity.title,
          description: activity.description || '',
          type: activity.type || 'one-time',
          recurrence: activity.recurrence || null,
          production_id: activity.productionId || null,
          cheese_type_id: activity.cheeseTypeId || null,
          is_completed: activity.completed || false,
          completed_dates: activity.completedDates || []
        })
        .eq('id', activity.id)
        .select()
        .single()

      if (error) throw error

      await logAction('update', 'attività', activity.id, { title: activity.title })
      return data
    }
  } catch (error) {
    console.error('Error saving activity:', error)
    throw error
  }
}

/**
 * Elimina un'attività
 */
export async function deleteActivity(activityId) {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    const { error } = await supabase
      .from('attività')
      .delete()
      .eq('id', activityId)

    if (error) throw error

    await logAction('delete', 'attività', activityId)
  } catch (error) {
    console.error('Error deleting activity:', error)
    throw error
  }
}

/**
 * Segna un'attività come completata/non completata
 */
export async function toggleActivityCompleted(activityId, completed, completedDates = []) {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    const updateData = { is_completed: completed }
    if (completedDates && completedDates.length > 0) {
      updateData.completed_dates = completedDates
    }
    
    const { data, error } = await supabase
      .from('attività')
      .update(updateData)
      .eq('id', activityId)
      .select()
      .single()

    if (error) throw error

    await logAction(completed ? 'complete' : 'uncomplete', 'attività', activityId)
    return {
      id: data.id,
      date: data.date ? new Date(data.date) : new Date(),
      title: data.title,
      description: data.description || '',
      type: data.type || 'one-time',
      recurrence: data.recurrence || undefined,
      productionId: data.production_id || undefined,
      cheeseTypeId: data.cheese_type_id || undefined,
      completed: data.is_completed || false,
      completedDates: data.completed_dates || [],
      createdAt: data.created_at ? new Date(data.created_at) : new Date()
    }
  } catch (error) {
    console.error('Error toggling activity completed:', error)
    throw error
  }
}

/**
 * Sottoscrizione real-time per formaggi
 */
export function subscribeToCheeses(callback) {
  if (!supabase) {
    return { unsubscribe: () => {} }
  }
  const channel = supabase
    .channel('formaggi-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'formaggi' },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old
        })
      }
    )
    .subscribe()
  
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    }
  }
}

/**
 * Sottoscrizione real-time per produzioni
 */
export function subscribeToProductions(callback) {
  if (!supabase) {
    return { unsubscribe: () => {} }
  }
  const channel = supabase
    .channel('produzioni-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'produzioni' },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old
        })
      }
    )
    .subscribe()
  
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    }
  }
}

/**
 * Sottoscrizione real-time per attività
 */
export function subscribeToActivities(callback) {
  if (!supabase) {
    return { unsubscribe: () => {} }
  }
  const channel = supabase
    .channel('attività-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'attività' },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old
        })
      }
    )
    .subscribe()
  
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    }
  }
}

/**
 * Carica i logs (per admin)
 */
export async function loadLogs(limit = 100) {
  if (!supabase) {
    return []
  }
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error loading logs:', error)
    return []
  }
}
