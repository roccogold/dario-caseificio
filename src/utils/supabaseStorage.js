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
        id: cheese.id,
        name: cheese.name,
        protocol: cheese.protocol,
        protocolLength: cheese.protocol?.length,
        hasDefaultFields: !!cheese.defaultFields,
        defaultFieldsKeys: cheese.defaultFields ? Object.keys(cheese.defaultFields) : [],
        defaultFields: cheese.defaultFields
      })
      console.log('[saveCheese] Converted dbData:', {
        id: dbData.id,
        name: dbData.name,
        protocol: dbData.protocol,
        protocolLength: dbData.protocol?.length,
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

    return (data || []).map(prod => {
      // Fix timezone issue: parse date string as local date, not UTC
      let productionDate = new Date();
      if (prod.production_date) {
        // If date is a string like "2026-01-24", parse it as local date
        if (typeof prod.production_date === 'string' && prod.production_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = prod.production_date.split('-').map(Number);
          productionDate = new Date(year, month - 1, day);
        } else {
          productionDate = new Date(prod.production_date);
        }
      }
      
      return {
      id: prod.id,
      productionNumber: prod.production_number,
        date: productionDate,
      totalLiters: prod.total_liters || 0,
      cheeses: prod.cheeses || [],
        notes: prod.notes || '',
        createdAt: prod.created_at ? new Date(prod.created_at) : new Date()
      };
    })
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
      
      // Fix timezone issue: parse date string as local date, not UTC
      let productionDate = production.date;
      if (data.production_date && typeof data.production_date === 'string' && data.production_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = data.production_date.split('-').map(Number);
        productionDate = new Date(year, month - 1, day);
      }
      
      return { 
        id: data.id, 
        ...production,
        date: productionDate // Use the correctly parsed local date
      }
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
      
      // Fix timezone issue: parse date string as local date, not UTC
      let productionDate = production.date;
      if (data.production_date && typeof data.production_date === 'string' && data.production_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = data.production_date.split('-').map(Number);
        productionDate = new Date(year, month - 1, day);
      }
      
      return {
        id: data.id,
        productionNumber: data.production_number,
        date: productionDate, // Use the correctly parsed local date
        totalLiters: data.total_liters || 0,
        cheeses: data.cheeses || [],
        notes: data.notes || '',
        createdAt: data.created_at ? new Date(data.created_at) : new Date()
      }
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

    return (data || []).map(activity => {
      // Fix timezone issue: parse date string as local date, not UTC
      let activityDate = new Date();
      if (activity.date) {
        // If date is a string like "2026-01-24", parse it as local date
        if (typeof activity.date === 'string' && activity.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = activity.date.split('-').map(Number);
          activityDate = new Date(year, month - 1, day);
        } else {
          activityDate = new Date(activity.date);
        }
      }
      
      return {
      id: activity.id,
        date: activityDate,
      title: activity.title,
      description: activity.description || '',
        type: activity.type || 'one-time',
        recurrence: activity.recurrence || undefined,
        productionId: activity.production_id || undefined,
        cheeseTypeId: activity.cheese_type_id || undefined,
        completed: activity.is_completed || false,
        completedDates: activity.completed_dates || [],
        createdAt: activity.created_at ? new Date(activity.created_at) : new Date()
      };
    })
  } catch (error) {
    console.error('Error loading activities:', error)
    return []
  }
}

/**
 * Helper function to format a date as YYYY-MM-DD in local timezone
 * This avoids timezone issues when converting to ISO string
 */
function formatDateLocal(date) {
  if (!date) return new Date().toISOString().split('T')[0];
  
  if (typeof date === 'string') {
    // If already a string in YYYY-MM-DD format, return it
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    // Otherwise parse it first
    date = new Date(date);
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  
  // Format as YYYY-MM-DD in local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Salva un'attività (create o update)
 */
export async function saveActivity(activity) {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    // Format date in local timezone to avoid UTC conversion issues
    const dateString = formatDateLocal(activity.date);
    
    // Debug logging (only in development)
    if (import.meta.env.DEV) {
      console.log('[saveActivity] Saving activity:', {
        id: activity.id,
        title: activity.title,
        originalDate: activity.date,
        originalDateType: typeof activity.date,
        originalDateIsDate: activity.date instanceof Date,
        formattedDate: dateString,
        protocolDay: activity.type === 'protocol' ? 'protocol activity' : 'not protocol'
      });
    }
    
    if (!activity.id || activity.id.startsWith('temp-') || typeof activity.id === 'number') {
      // Nuova attività
      const { data, error } = await supabase
        .from('attività')
        .insert({
          date: dateString,
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
      
      // Fix timezone issue: parse date string as local date, not UTC
      let activityDate = activity.date; // Use original activity date which is already correct
      if (data.date && typeof data.date === 'string' && data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = data.date.split('-').map(Number);
        activityDate = new Date(year, month - 1, day);
      }
      
      if (import.meta.env.DEV) {
        console.log('[saveActivity] ✅ Activity created:', {
          id: data.id,
          title: data.title,
          dbDate: data.date,
          parsedDate: formatDateLocal(activityDate),
          originalDate: formatDateLocal(activity.date)
        });
      }
      
      // Return activity with correct date (already parsed correctly from activity object)
      return { 
        id: data.id, 
        ...activity,
        date: activityDate // Use the correctly parsed local date
      }
    } else {
      // Update attività esistente
      const { data, error } = await supabase
        .from('attività')
        .update({
          date: dateString,
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
      
      // Fix timezone issue: parse date string as local date, not UTC
      let activityDate = activity.date; // Use original activity date which is already correct
      if (data.date && typeof data.date === 'string' && data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = data.date.split('-').map(Number);
        activityDate = new Date(year, month - 1, day);
      }
      
      if (import.meta.env.DEV) {
        console.log('[saveActivity] ✅ Activity updated:', {
          id: data.id,
          title: data.title,
          dbDate: data.date,
          parsedDate: formatDateLocal(activityDate),
          originalDate: formatDateLocal(activity.date)
        });
      }
      
      return {
        id: data.id,
        date: activityDate,
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
    
    // Fix timezone issue: parse date string as local date, not UTC
    let activityDate = new Date();
    if (data.date) {
      // If date is a string like "2026-01-24", parse it as local date
      if (typeof data.date === 'string' && data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = data.date.split('-').map(Number);
        activityDate = new Date(year, month - 1, day);
      } else {
        activityDate = new Date(data.date);
      }
    }
    
    return {
      id: data.id,
      date: activityDate,
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
