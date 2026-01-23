import { supabase } from './supabase'
import { CheeseType, Production, Activity } from "@/types"
import {
  dbCheeseToType,
  dbProductionToType,
  dbActivityToType,
  typeCheeseToDb,
  typeProductionToDb,
  typeActivityToDb,
} from "@/lib/adapters"

/**
 * Ottiene l'IP dell'utente (semplificato - in produzione usa un servizio esterno)
 */
async function getUserIP(): Promise<string> {
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
export async function logAction(
  action: string,
  entityType: string,
  entityId: string | null = null,
  details: Record<string, any> = {}
): Promise<void> {
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
export async function loadCheeses(): Promise<CheeseType[]> {
  if (!supabase) {
    return []
  }
  try {
    const { data, error } = await supabase
      .from('formaggi')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return (data || []).map(dbCheeseToType)
  } catch (error) {
    console.error('Error loading cheeses:', error)
    return []
  }
}

/**
 * Salva un formaggio (create o update)
 */
export async function saveCheese(cheese: Omit<CheeseType, "id" | "createdAt"> & { id?: string }): Promise<CheeseType> {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    const dbData = typeCheeseToDb(cheese)
    
    if (!cheese.id || cheese.id.startsWith('temp-')) {
      // Nuovo formaggio - Prova prima senza ID, se fallisce prova con ID
      const { id: _, ...dbDataWithoutId } = dbData;
      
      console.log('[saveCheese] 🔵 Starting insert:', { 
        name: cheese.name,
        hasId: !!cheese.id,
        id: cheese.id,
        insertDataKeys: Object.keys(dbDataWithoutId)
      });
      
      // Prova prima senza ID (se il DB ha default UUID)
      let insertedData: any[] | null = null;
      let insertError: any = null;
      
      const { data: dataWithoutId, error: errorWithoutId } = await supabase
        .from('formaggi')
        .insert(dbDataWithoutId)
        .select();

      if (errorWithoutId) {
        console.log('[saveCheese] ⚠️ Insert without ID failed, trying with ID:', errorWithoutId.message);
        insertError = errorWithoutId;
        
        // Se fallisce senza ID, prova con ID (se fornito)
        if (cheese.id && !cheese.id.startsWith('temp-')) {
          const { data: dataWithId, error: errorWithId } = await supabase
            .from('formaggi')
            .insert(dbData)
            .select();
          
          if (!errorWithId && dataWithId && dataWithId.length > 0) {
            insertedData = dataWithId;
            insertError = null;
            console.log('[saveCheese] ✅ Insert with ID succeeded');
          } else {
            insertError = errorWithId || insertError;
          }
        }
      } else {
        insertedData = dataWithoutId;
      }

      if (insertError) {
        console.error('[saveCheese] ❌ Insert error:', insertError);
        console.error('[saveCheese] Error details:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        });
        throw insertError;
      }

      if (!insertedData || insertedData.length === 0) {
        console.error('[saveCheese] ❌ Insert succeeded but no data returned');
        console.error('[saveCheese] This might be due to RLS policies preventing SELECT after INSERT');
        throw new Error('Insert completed but no data returned from database. Check RLS policies.');
      }

      // Prendi il primo risultato (dovrebbe essere l'unico)
      const inserted = insertedData[0];
      console.log('[saveCheese] ✅ Cheese inserted successfully with ID:', inserted.id);

      await logAction('create', 'formaggio', inserted.id, { name: cheese.name })
      return dbCheeseToType(inserted as any)
    } else {
      // Update formaggio esistente
      console.log('[saveCheese] Updating cheese:', cheese.id);
      
      const { data, error } = await supabase
        .from('formaggi')
        .update(dbData)
        .eq('id', cheese.id)
        .select()

      if (error) {
        console.error('[saveCheese] Update error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(`Cheese with id ${cheese.id} not found for update`);
      }

      // Prendi il primo risultato
      const updated = data[0];
      console.log('[saveCheese] ✅ Cheese updated successfully:', updated.id);

      await logAction('update', 'formaggio', cheese.id, { name: cheese.name })
      return dbCheeseToType(updated as any)
    }
  } catch (error) {
    console.error('[saveCheese] ❌ Error saving cheese:', error)
    throw error
  }
}

/**
 * Elimina un formaggio
 */
export async function deleteCheese(cheeseId: string): Promise<void> {
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
export async function loadProductions(): Promise<Production[]> {
  if (!supabase) {
    return []
  }
  try {
    const { data, error } = await supabase
      .from('produzioni')
      .select('*')
      .order('production_date', { ascending: false })

    if (error) throw error

    return (data || []).map(dbProductionToType)
  } catch (error) {
    console.error('Error loading productions:', error)
    return []
  }
}

/**
 * Salva una produzione (create o update)
 */
export async function saveProduction(
  production: Omit<Production, "id" | "createdAt" | "totalLiters"> & { id?: string; totalLiters?: number }
): Promise<Production> {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    const dbData = typeProductionToDb(production)
    
    if (!production.id || production.id.startsWith('temp-')) {
      // Nuova produzione - NON includere l'ID, lascia che il database lo generi
      // Questo evita problemi con "Cannot coerce" quando si include l'ID manualmente
      const { id: _, ...dbDataWithoutId } = dbData;
      
      console.log('[saveProduction] 🔵 Starting insert (DB will generate ID):', { 
        productionNumber: production.productionNumber,
        insertDataKeys: Object.keys(dbDataWithoutId)
      });
      
      // Insert con select - il database genererà l'ID automaticamente
      const { data: insertedData, error: insertError } = await supabase
        .from('produzioni')
        .insert(dbDataWithoutId)
        .select();

      if (insertError) {
        console.error('[saveProduction] ❌ Insert error:', insertError);
        console.error('[saveProduction] Error details:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        });
        throw insertError;
      }

      if (!insertedData || insertedData.length === 0) {
        console.error('[saveProduction] ❌ Insert succeeded but no data returned');
        throw new Error('Insert completed but no data returned from database');
      }

      // Prendi il primo risultato (dovrebbe essere l'unico)
      const inserted = insertedData[0];
      console.log('[saveProduction] ✅ Production inserted successfully with DB-generated ID:', inserted.id);

      await logAction('create', 'produzione', inserted.id, { 
        production_number: production.productionNumber 
      })
      return dbProductionToType(inserted as any)
    } else {
      // Update produzione esistente
      console.log('[saveProduction] Updating production:', production.id);
      
      const { data, error } = await supabase
        .from('produzioni')
        .update(dbData)
        .eq('id', production.id)
        .select()

      if (error) {
        console.error('[saveProduction] Update error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(`Production with id ${production.id} not found for update`);
      }

      // Prendi il primo risultato
      const updated = data[0];
      console.log('[saveProduction] ✅ Production updated successfully:', updated.id);

      await logAction('update', 'produzione', production.id, { 
        production_number: production.productionNumber 
      })
      return dbProductionToType(updated as any)
    }
  } catch (error) {
    console.error('[saveProduction] ❌ Error saving production:', error)
    throw error
  }
}

/**
 * Elimina una produzione
 */
export async function deleteProduction(productionId: string): Promise<void> {
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
export async function loadActivities(): Promise<Activity[]> {
  if (!supabase) {
    return []
  }
  try {
    const { data, error } = await supabase
      .from('attività')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    return (data || []).map(dbActivityToType)
  } catch (error) {
    console.error('Error loading activities:', error)
    return []
  }
}

/**
 * Salva un'attività (create o update)
 */
export async function saveActivity(
  activity: Omit<Activity, "id" | "createdAt"> & { id?: string }
): Promise<Activity> {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    const dbData = typeActivityToDb(activity)
    
    if (!activity.id || activity.id.startsWith('temp-')) {
      // Nuova attività - Prova prima senza ID, se fallisce prova con ID
      const { id: _, ...dbDataWithoutId } = dbData;
      
      console.log('[saveActivity] 🔵 Starting insert:', { 
        title: activity.title,
        type: activity.type,
        hasId: !!activity.id,
        id: activity.id,
        insertDataKeys: Object.keys(dbDataWithoutId)
      });
      
      // Prova prima senza ID (se il DB ha default UUID)
      let insertedData: any[] | null = null;
      let insertError: any = null;
      
      const { data: dataWithoutId, error: errorWithoutId } = await supabase
        .from('attività')
        .insert(dbDataWithoutId)
        .select();

      if (errorWithoutId) {
        console.log('[saveActivity] ⚠️ Insert without ID failed, trying with ID:', errorWithoutId.message);
        insertError = errorWithoutId;
        
        // Se fallisce senza ID, prova con ID (se fornito)
        if (activity.id && !activity.id.startsWith('temp-')) {
          const { data: dataWithId, error: errorWithId } = await supabase
            .from('attività')
            .insert(dbData)
            .select();
          
          if (!errorWithId && dataWithId && dataWithId.length > 0) {
            insertedData = dataWithId;
            insertError = null;
            console.log('[saveActivity] ✅ Insert with ID succeeded');
          } else {
            insertError = errorWithId || insertError;
          }
        }
      } else {
        insertedData = dataWithoutId;
      }

      if (insertError) {
        console.error('[saveActivity] ❌ Insert error:', insertError);
        console.error('[saveActivity] Error details:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        });
        throw insertError;
      }

      if (!insertedData || insertedData.length === 0) {
        console.error('[saveActivity] ❌ Insert succeeded but no data returned');
        console.error('[saveActivity] This might be due to RLS policies preventing SELECT after INSERT');
        throw new Error('Insert completed but no data returned from database. Check RLS policies.');
      }

      // Prendi il primo risultato (dovrebbe essere l'unico)
      const inserted = insertedData[0];
      console.log('[saveActivity] ✅ Activity inserted successfully with ID:', inserted.id);

      await logAction('create', 'attività', inserted.id, { title: activity.title })
      return dbActivityToType(inserted as any)
    } else {
      // Update attività esistente
      console.log('[saveActivity] Updating activity:', activity.id);
      
      const { data, error } = await supabase
        .from('attività')
        .update(dbData)
        .eq('id', activity.id)
        .select()

      if (error) {
        console.error('[saveActivity] Update error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(`Activity with id ${activity.id} not found for update`);
      }

      // Prendi il primo risultato
      const updated = data[0];
      console.log('[saveActivity] ✅ Activity updated successfully:', updated.id);

      await logAction('update', 'attività', activity.id, { title: activity.title })
      return dbActivityToType(updated as any)
    }
  } catch (error) {
    console.error('[saveActivity] ❌ Error saving activity:', error)
    throw error
  }
}

/**
 * Elimina un'attività
 */
export async function deleteActivity(activityId: string): Promise<void> {
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
export async function toggleActivityCompleted(activityId: string, completed: boolean): Promise<Activity> {
  if (!supabase) {
    throw new Error('Supabase non configurato')
  }
  try {
    const { data, error } = await supabase
      .from('attività')
      .update({ is_completed: completed })
      .eq('id', activityId)
      .select()

    if (error) {
      console.error('[toggleActivityCompleted] Update error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error(`Activity with id ${activityId} not found for update`);
    }

    const updated = data[0];
    await logAction(completed ? 'complete' : 'uncomplete', 'attività', activityId)
    return dbActivityToType(updated as any)
  } catch (error) {
    console.error('[toggleActivityCompleted] ❌ Error toggling activity completed:', error)
    throw error
  }
}

/**
 * Sottoscrizione real-time per formaggi
 */
export function subscribeToCheeses(callback: (payload: { eventType: string; new: any; old: any }) => void) {
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
export function subscribeToProductions(callback: (payload: { eventType: string; new: any; old: any }) => void) {
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
export function subscribeToActivities(callback: (payload: { eventType: string; new: any; old: any }) => void) {
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
export async function loadLogs(limit: number = 100): Promise<any[]> {
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
