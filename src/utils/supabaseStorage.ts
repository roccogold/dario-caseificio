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
    // Verifica sessione e autenticazione prima di procedere
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[saveCheese] ❌ Session error:', sessionError);
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!session) {
      console.error('[saveCheese] ❌ No session found - attempting to refresh...');
      // Prova a refreshare la sessione
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshedSession) {
        console.error('[saveCheese] ❌ Session refresh failed:', refreshError);
        throw new Error(`User not authenticated. Please log in again. Session error: ${refreshError?.message || 'No session after refresh'}`);
      }
      
      console.log('[saveCheese] ✅ Session refreshed successfully');
    }
    
    // Verifica che l'utente esista
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[saveCheese] ❌ Authentication error:', authError);
      console.error('[saveCheese] Session exists:', !!session);
      throw new Error(`User not authenticated. RLS policies require auth.uid() IS NOT NULL. Error: ${authError?.message || 'No user found'}`);
    }
    
    console.log('[saveCheese] ✅ User authenticated:', user.id);
    console.log('[saveCheese] Session valid:', !!session, 'Token expires at:', session?.expires_at);
    
    // Valida campi obbligatori
    if (!cheese.name || cheese.name.trim() === '') {
      throw new Error('Name is required (NOT NULL constraint)');
    }
    
    const dbData = typeCheeseToDb(cheese)
    
    // Verifica che i dati convertiti siano validi
    if (!dbData.name) {
      console.error('[saveCheese] ❌ Invalid data after conversion:', dbData);
      throw new Error('Invalid data: name missing after conversion');
    }
    
    if (!cheese.id || cheese.id.startsWith('temp-')) {
      // Nuovo formaggio
      const { id: _, ...dbDataWithoutId } = dbData;
      
      console.log('[saveCheese] 🔵 Starting insert:', { 
        name: cheese.name,
        insertDataKeys: Object.keys(dbDataWithoutId)
      });
      
      // ✅ INSERT SENZA ID - Supabase lo genererà con gen_random_uuid()
      const { error: insertError, data: insertData } = await supabase
        .from('formaggi')
        .insert(dbDataWithoutId) // ✅ NO ID!
        .select()
        .single(); // ✅ Usa .single() invece di [0]
      
      if (insertError) {
        console.error('[saveCheese] ❌ Insert error:', insertError);
        console.error('[saveCheese] Error details:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Gestisci errori specifici
        if (insertError.code === '23505') {
          throw new Error(`Unique constraint violation (name already exists): ${insertError.details || insertError.message}`);
        }
        if (insertError.code === '23503') {
          throw new Error(`Foreign key constraint violation: ${insertError.details || insertError.message}`);
        }
        if (insertError.code === '23502') {
          throw new Error(`NOT NULL constraint violation: ${insertError.details || insertError.message}`);
        }
        if (insertError.code === 'PGRST116') {
          throw new Error(`PostgREST error: Insert returned 0 rows. Possible causes: RLS policy blocking, constraint violation, or missing required fields. Details: ${insertError.details || insertError.message}`);
        }
        
        throw insertError;
      }
      
      // insertData contiene già il record con l'ID generato
      const inserted = insertData;
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
      // Nuova produzione
      const { id: _, ...dbDataWithoutId } = dbData;
      
      console.log('[saveProduction] 🔵 Starting insert:', { 
        productionNumber: production.productionNumber,
        insertDataKeys: Object.keys(dbDataWithoutId)
      });
      
      // ✅ INSERT SENZA ID
      const { error: insertError, data: insertData } = await supabase
        .from('produzioni')
        .insert(dbDataWithoutId) // NO ID!
        .select()
        .single();

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

      const inserted = insertData;
      console.log('[saveProduction] ✅ Production inserted with ID:', inserted.id);

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
    // Verifica sessione e autenticazione prima di procedere
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[saveActivity] ❌ Session error:', sessionError);
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!session) {
      console.error('[saveActivity] ❌ No session found - attempting to refresh...');
      // Prova a refreshare la sessione
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshedSession) {
        console.error('[saveActivity] ❌ Session refresh failed:', refreshError);
        throw new Error(`User not authenticated. Please log in again. Session error: ${refreshError?.message || 'No session after refresh'}`);
      }
      
      console.log('[saveActivity] ✅ Session refreshed successfully');
    }
    
    // Verifica che l'utente esista
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[saveActivity] ❌ Authentication error:', authError);
      console.error('[saveActivity] Session exists:', !!session);
      throw new Error(`User not authenticated. RLS policies require auth.uid() IS NOT NULL. Error: ${authError?.message || 'No user found'}`);
    }
    
    console.log('[saveActivity] ✅ User authenticated:', user.id);
    console.log('[saveActivity] Session valid:', !!session, 'Token expires at:', session?.expires_at);
    
    // Valida campi obbligatori
    if (!activity.title || activity.title.trim() === '') {
      throw new Error('Title is required (NOT NULL constraint)');
    }
    if (!activity.date) {
      throw new Error('Date is required (NOT NULL constraint)');
    }
    
    const dbData = typeActivityToDb(activity)
    
    // Verifica che i dati convertiti siano validi
    if (!dbData.title || !dbData.date) {
      console.error('[saveActivity] ❌ Invalid data after conversion:', dbData);
      throw new Error('Invalid data: title or date missing after conversion');
    }
    
    if (!activity.id || activity.id.startsWith('temp-')) {
      // Nuova attività
      const { id: _, ...dbDataWithoutId } = dbData;
      
      console.log('[saveActivity] 🔵 Starting insert:', { 
        title: activity.title,
        type: activity.type,
        insertData: dbDataWithoutId
      });
      
      // ✅ INSERT SENZA ID
      const { error: insertError, data: insertData } = await supabase
        .from('attività')
        .insert(dbDataWithoutId) // NO ID!
        .select()
        .single();
      
      if (insertError) {
        console.error('[saveActivity] ❌ Insert error:', insertError);
        console.error('[saveActivity] Error details:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Se è un errore di constraint, fornisci più dettagli
        if (insertError.code === '23505') {
          throw new Error(`Unique constraint violation: ${insertError.details || insertError.message}`);
        }
        if (insertError.code === '23503') {
          throw new Error(`Foreign key constraint violation: ${insertError.details || insertError.message}`);
        }
        if (insertError.code === '23502') {
          throw new Error(`NOT NULL constraint violation: ${insertError.details || insertError.message}`);
        }
        if (insertError.code === 'PGRST116') {
          throw new Error(`PostgREST error: Insert returned 0 rows. Possible causes: RLS policy blocking, constraint violation, or missing required fields. Details: ${insertError.details || insertError.message}`);
        }
        
        throw insertError;
      }

      const inserted = insertData;
      console.log('[saveActivity] ✅ Activity inserted with ID:', inserted.id);

      await logAction('create', 'attività', inserted.id, { title: activity.title })
      return dbActivityToType(inserted as any)
    } else {
      // Update attività esistente
      console.log('[saveActivity] Updating activity:', activity.id);
      
      // Verifica sessione e autenticazione
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[saveActivity] ❌ Session error during update:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        console.error('[saveActivity] ❌ No session found during update - attempting to refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          console.error('[saveActivity] ❌ Session refresh failed during update:', refreshError);
          throw new Error(`User not authenticated. Please log in again. Session error: ${refreshError?.message || 'No session after refresh'}`);
        }
        
        console.log('[saveActivity] ✅ Session refreshed successfully for update');
      }
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[saveActivity] ❌ Authentication error during update:', authError);
        console.error('[saveActivity] Session exists:', !!session);
        throw new Error(`User not authenticated. RLS policies require auth.uid() IS NOT NULL. Error: ${authError?.message || 'No user found'}`);
      }
      
      console.log('[saveActivity] ✅ User authenticated for update:', user.id);
      console.log('[saveActivity] Session valid:', !!session, 'Token expires at:', session?.expires_at);
      
      // Prima verifica che la riga esista e sia visibile
      const { data: existingData, error: checkError } = await supabase
        .from('attività')
        .select('id, title')
        .eq('id', activity.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('[saveActivity] ❌ Error checking if activity exists:', checkError);
        throw new Error(`Failed to check if activity exists: ${checkError.message}`);
      }
      
      if (!existingData) {
        console.error('[saveActivity] ❌ Activity not found or not visible (RLS issue):', activity.id);
        throw new Error(`Activity with id ${activity.id} not found or not visible. This might be an RLS policy issue - check that SELECT policy allows reading this activity.`);
      }
      
      console.log('[saveActivity] Activity exists and is visible, proceeding with update');
      
      // Ora fai l'update
      const { data, error } = await supabase
        .from('attività')
        .update(dbData)
        .eq('id', activity.id)
        .select()

      if (error) {
        console.error('[saveActivity] ❌ Update error:', error);
        console.error('[saveActivity] Update error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          activityId: activity.id,
          userId: user.id
        });
        
        // Gestisci errori specifici
        if (error.code === 'PGRST116') {
          throw new Error(`PostgREST error: Update returned 0 rows. The activity exists but UPDATE policy might be blocking it. Check RLS UPDATE policy for attività table. Activity ID: ${activity.id}`);
        }
        if (error.code === '23505') {
          throw new Error(`Unique constraint violation: ${error.details || error.message}`);
        }
        if (error.code === '23503') {
          throw new Error(`Foreign key constraint violation: ${error.details || error.message}`);
        }
        
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('[saveActivity] ❌ Update succeeded but no data returned - RLS UPDATE policy issue');
        throw new Error(`Update completed but no data returned. This is likely an RLS policy issue - the UPDATE policy WITH CHECK clause might be blocking the return. Activity ID: ${activity.id}`);
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
