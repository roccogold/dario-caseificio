import { useState, useEffect, useMemo, useCallback } from "react";
import { CheeseType, Production, Activity, MonthlyStats } from "@/types";
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
  addDays
} from "date-fns";
import { supabase } from "@/utils/supabase";
import {
  loadCheeses,
  saveCheese,
  deleteCheese as deleteCheeseFromSupabase,
  loadProductions,
  saveProduction,
  deleteProduction as deleteProductionFromSupabase,
  loadActivities,
  saveActivity,
  deleteActivity as deleteActivityFromSupabase,
  toggleActivityCompleted,
  subscribeToCheeses,
  subscribeToProductions,
  subscribeToActivities,
} from "@/utils/supabaseStorage";
import {
  localCheeses,
  localProductions,
  localActivities,
} from "@/utils/localStorage";
import { toast } from "sonner";
import { generateUUID } from "@/lib/utils";

// Determina se usare Supabase o localStorage
const isProduction = import.meta.env.PROD;
const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
const hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseInitialized = !!supabase;

// In produzione, Supabase è OBBLIGATORIO - nessun fallback a localStorage
if (isProduction) {
  console.log('[useData] 🔍 Production mode check:');
  console.log('[useData]   - VITE_SUPABASE_URL:', hasSupabaseUrl ? '✅ Present' : '❌ MISSING');
  console.log('[useData]   - VITE_SUPABASE_ANON_KEY:', hasSupabaseKey ? '✅ Present' : '❌ MISSING');
  console.log('[useData]   - supabase client:', supabaseInitialized ? '✅ Initialized' : '❌ NOT INITIALIZED');
  
  if (!hasSupabaseUrl || !hasSupabaseKey || !supabaseInitialized) {
    const errorMsg = `❌ FATAL: Supabase non configurato in produzione!
    VITE_SUPABASE_URL: ${hasSupabaseUrl ? 'OK' : 'MISSING'}
    VITE_SUPABASE_ANON_KEY: ${hasSupabaseKey ? 'OK' : 'MISSING'}
    supabase client: ${supabaseInitialized ? 'OK' : 'NOT INITIALIZED'}
    
    Configura le variabili d'ambiente in Vercel:
    1. Vai su Vercel Dashboard → Project Settings → Environment Variables
    2. Aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
    3. Redeploy l'applicazione`;
    
    console.error('[useData]', errorMsg);
    alert(errorMsg); // Mostra alert anche all'utente
    throw new Error('Supabase deve essere configurato in produzione');
  }
  
  console.log('[useData] ✅ Production mode: Supabase configurato correttamente');
}

const useSupabase = isProduction ? true : (hasSupabaseUrl && hasSupabaseKey && supabaseInitialized);

console.log('[useData] Final decision - useSupabase:', useSupabase, '(isProduction:', isProduction, ')');

// Log per debugging
if (isProduction) {
  console.log('[useData] ✅ Production mode: Supabase OBBLIGATORIO');
  console.log('[useData] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing');
  console.log('[useData] supabase client:', supabase ? '✅ Initialized' : '❌ Not initialized');
  console.log('[useData] Using Supabase:', useSupabase ? '✅ Yes' : '❌ No');
}

export function useData() {
  const [cheeseTypes, setCheeseTypes] = useState<CheeseType[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // CARICAMENTO INIZIALE
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // In produzione, FORZA il caricamento da Supabase
      if (isProduction && !useSupabase) {
        const errorMsg = '❌ ERRORE CRITICO: Supabase non configurato in produzione! Impossibile caricare i dati.';
        console.error('[useData]', errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }
      
      try {
        if (useSupabase) {
          console.log('[useData] 🔵 Loading data from Supabase...');
          if (!supabase) {
            throw new Error('Supabase client non inizializzato');
          }
          
          // Carica da Supabase
          const [cheeses, prods, acts] = await Promise.all([
            loadCheeses(),
            loadProductions(),
            loadActivities(),
          ]);
          
          console.log('[useData] ✅ Loaded from Supabase:', {
            cheeses: cheeses.length,
            productions: prods.length,
            activities: acts.length
          });
          
          setCheeseTypes(cheeses);
          setProductions(prods);
          setActivities(acts);
        } else {
          // Solo in sviluppo locale
          console.log('[useData] Loading data from localStorage (development mode)');
          const localCheesesData = localCheeses.load();
          const localProductionsData = localProductions.load();
          const localActivitiesData = localActivities.load();
          
          setCheeseTypes(localCheesesData);
          setProductions(localProductionsData);
          setActivities(localActivitiesData);
        }
      } catch (error: any) {
        console.error('[useData] ❌ Error loading data:', error);
        console.error('[useData] Error details:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint
        });
        
        if (isProduction) {
          // In produzione, NON fare fallback - mostra errore fatale
          const errorMsg = `❌ ERRORE CRITICO: Impossibile caricare i dati dal database: ${error?.message || 'Errore sconosciuto'}`;
          toast.error(errorMsg);
          console.error('[useData] FATAL: Cannot load from database in production');
          // Non impostare i dati - lascia gli array vuoti
        } else {
          // Solo in sviluppo, fallback a localStorage
          toast.error('Errore nel caricamento dati. Usando localStorage come fallback.');
          setCheeseTypes(localCheeses.load());
          setProductions(localProductions.load());
          setActivities(localActivities.load());
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // ============================================
  // REAL-TIME SUBSCRIPTIONS (solo produzione)
  // ============================================
  useEffect(() => {
    if (!useSupabase) return;

    const unsubscribeCheeses = subscribeToCheeses((payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        // Nuovo formaggio aggiunto da altro utente
        setCheeseTypes(prev => {
          const exists = prev.find(c => c.id === payload.new.id);
          if (exists) return prev;
          return [...prev, payload.new as any];
        });
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        // Formaggio aggiornato
        setCheeseTypes(prev =>
          prev.map(c => c.id === payload.new.id ? payload.new as any : c)
        );
      } else if (payload.eventType === 'DELETE' && payload.old) {
        // Formaggio eliminato
        setCheeseTypes(prev => prev.filter(c => c.id !== payload.old.id));
      }
    });

    const unsubscribeProductions = subscribeToProductions((payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        setProductions(prev => {
          const exists = prev.find(p => p.id === payload.new.id);
          if (exists) return prev;
          return [...prev, payload.new as any];
        });
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setProductions(prev =>
          prev.map(p => p.id === payload.new.id ? payload.new as any : p)
        );
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setProductions(prev => prev.filter(p => p.id !== payload.old.id));
      }
    });

    const unsubscribeActivities = subscribeToActivities((payload) => {
      console.log('[useData] Real-time activity event:', payload.eventType, payload.new?.id || payload.old?.id);
      
      if (payload.eventType === 'INSERT' && payload.new) {
        setActivities(prev => {
          const exists = prev.find(a => a.id === payload.new.id);
          if (exists) {
            console.log('[useData] ⚠️ Activity already exists in state, skipping duplicate:', payload.new.id);
            return prev;
          }
          console.log('[useData] ✅ Adding activity from real-time subscription:', payload.new.id);
          return [...prev, payload.new as any];
        });
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setActivities(prev =>
          prev.map(a => a.id === payload.new.id ? payload.new as any : a)
        );
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setActivities(prev => prev.filter(a => a.id !== payload.old.id));
      }
    });

    return () => {
      unsubscribeCheeses.unsubscribe();
      unsubscribeProductions.unsubscribe();
      unsubscribeActivities.unsubscribe();
    };
  }, [useSupabase]);

  // ============================================
  // CHEESE TYPE OPERATIONS
  // ============================================
  const addCheeseType = useCallback(async (cheese: Omit<CheeseType, "id" | "createdAt">) => {
    // ✅ NON generare l'ID per Supabase - lascia che lo generi il database
    const newCheese = {
      ...cheese,
      createdAt: new Date(),
      // ❌ RIMOSSO: id: generateUUID(),
    };

    // In produzione, FORZA l'uso di Supabase
    if (isProduction && !useSupabase) {
      const errorMsg = '❌ ERRORE CRITICO: Supabase non configurato in produzione! Il formaggio NON può essere salvato.';
      console.error('[addCheeseType]', errorMsg);
      toast.error(errorMsg);
      throw new Error('Supabase non configurato in produzione');
    }

    try {
      if (useSupabase) {
        console.log('[addCheeseType] 🔵 Attempting to save to Supabase:', { 
          name: newCheese.name, 
          hasYield: !!newCheese.yieldPercentage, 
          hasPrices: !!newCheese.prices,
          supabaseConfigured: !!supabase
        });
        
        if (!supabase) {
          throw new Error('Supabase client non inizializzato');
        }
        
        const saved = await saveCheese(newCheese); // Supabase genererà l'UUID
        console.log('[addCheeseType] ✅ Successfully saved to Supabase:', saved.id);
        
        // ❌ RIMOSSO: setCheeseTypes((prev) => [...prev, saved]);
        // La real-time subscription aggiungerà automaticamente il formaggio
        
        return saved;
      } else {
        // Solo in sviluppo locale - qui genera l'ID
        const cheeseWithId = {
          ...newCheese,
          id: generateUUID(),
        } as CheeseType;
        console.log('[addCheeseType] Using localStorage (development mode)');
        localCheeses.add(cheeseWithId);
        setCheeseTypes((prev) => [...prev, cheeseWithId]);
        return cheeseWithId;
      }
    } catch (error: any) {
      console.error('[addCheeseType] ❌ Error saving cheese:', error);
      const errorMessage = error?.message || 'Errore sconosciuto';
      console.error('[addCheeseType] Error details:', { 
        message: errorMessage, 
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      
      if (isProduction) {
        // In produzione, NON fare fallback - mostra errore e NON salvare
        toast.error(`❌ ERRORE CRITICO: ${errorMessage}. Il formaggio NON è stato salvato nel database.`);
        throw error; // Rilancia l'errore per impedire il salvataggio
      } else {
        // Solo in sviluppo, fallback a localStorage
        const cheeseWithId = {
          ...newCheese,
          id: generateUUID(),
        } as CheeseType;
        toast.error(`Errore nel salvataggio su database: ${errorMessage}. Salvato in locale come fallback.`);
        localCheeses.add(cheeseWithId);
        setCheeseTypes((prev) => [...prev, cheeseWithId]);
        return cheeseWithId;
      }
    }
  }, [useSupabase]);

  const updateCheeseType = useCallback(async (id: string, updates: Partial<CheeseType>) => {
    try {
      const current = cheeseTypes.find(c => c.id === id);
      if (!current) return;

      // Se il protocollo viene modificato, aggiorna le attività di protocollo esistenti
      if (updates.protocol !== undefined) {
        // Trova tutte le produzioni che contengono questo formaggio
        const relatedProductions = productions.filter(p =>
          p.cheeses.some(c => c.cheeseTypeId === id)
        );

        // Per ogni produzione, elimina le vecchie attività di protocollo per questo formaggio
        for (const production of relatedProductions) {
          const oldProtocolActivities = activities.filter(
            a => a.type === 'protocol' &&
                 a.productionId === production.id &&
                 a.cheeseTypeId === id
          );

          // Elimina le vecchie attività
          for (const activity of oldProtocolActivities) {
            if (useSupabase) {
              try {
                await deleteActivityFromSupabase(activity.id);
              } catch (err) {
                console.error('Error deleting old protocol activity:', err);
              }
            } else {
              localActivities.delete(activity.id);
            }
          }
          setActivities((prev) =>
            prev.filter(a => !(a.type === 'protocol' && a.productionId === production.id && a.cheeseTypeId === id))
          );

          // Ricrea le attività di protocollo con il nuovo protocollo
          const productionCheese = production.cheeses.find(c => c.cheeseTypeId === id);
          if (productionCheese && updates.protocol && updates.protocol.length > 0) {
            const newProtocolActivities: Omit<Activity, "id" | "createdAt">[] = [];
            const productionDate = new Date(production.date);
            productionDate.setHours(0, 0, 0, 0);

            for (const protocolStep of updates.protocol) {
              const activityDate = addDays(productionDate, protocolStep.day);
              activityDate.setHours(0, 0, 0, 0);

              const activityTitle = protocolStep.activity;
              const activityDescription = `Lotto: ${production.productionNumber} | ${productionCheese.liters}L`;

              // ✅ NON includere id e createdAt - saveActivity li gestirà
              const protocolActivity: Omit<Activity, "id" | "createdAt"> = {
                // ❌ RIMOSSO: id: generateUUID(),
                // ❌ RIMOSSO: createdAt: new Date(),
                title: activityTitle,
                description: activityDescription,
                date: activityDate,
                type: 'protocol',
                productionId: production.id,
                cheeseTypeId: id,
                completed: false,
              };

              newProtocolActivities.push(protocolActivity);
            }

            // Salva le nuove attività
            for (const protocolActivity of newProtocolActivities) {
              try {
                if (useSupabase) {
                  const savedActivity = await saveActivity(protocolActivity);
                  console.log('[updateCheeseType] ✅ Protocol activity created:', savedActivity.title);
                  
                  // ❌ RIMOSSO: setActivities - la subscription lo fa automaticamente
                  // setActivities((prev) => {
                  //   const exists = prev.some(a => a.id === savedActivity.id);
                  //   if (exists) return prev;
                  //   return [...prev, savedActivity];
                  // });
                } else {
                  // Solo localStorage - qui genera l'ID
                  const activityWithId = {
                    ...protocolActivity,
                    id: generateUUID(),
                    createdAt: new Date(),
                  } as Activity;
                  localActivities.add(activityWithId);
                  setActivities((prev) => {
                    const exists = prev.some(a => a.id === activityWithId.id);
                    if (exists) return prev;
                    return [...prev, activityWithId];
                  });
                }
              } catch (error) {
                console.error('Error creating new protocol activity:', error);
              }
            }
          }
        }
      }

      // Aggiorna il formaggio
      if (useSupabase) {
        const updated = await saveCheese({ ...current, ...updates, id });
        setCheeseTypes((prev) =>
          prev.map((c) => (c.id === id ? updated : c))
        );
      } else {
        localCheeses.update(id, updates);
        setCheeseTypes((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
        );
      }
    } catch (error) {
      console.error('Error updating cheese:', error);
      toast.error('Errore nell\'aggiornamento del formaggio');
      // Fallback
      localCheeses.update(id, updates);
      setCheeseTypes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    }
  }, [useSupabase, cheeseTypes, productions, activities]);

  const deleteCheeseType = useCallback(async (id: string) => {
    try {
      // Trova tutte le attività associate a questo formaggio
      const relatedActivities = activities.filter(
        a => a.cheeseTypeId === id
      );

      // Elimina il formaggio
      if (useSupabase) {
        await deleteCheeseFromSupabase(id);
        setCheeseTypes((prev) => prev.filter((c) => c.id !== id));
        
        // Elimina anche le attività associate
        for (const activity of relatedActivities) {
          try {
            await deleteActivityFromSupabase(activity.id);
          } catch (err) {
            console.error('Error deleting related activity:', err);
          }
        }
        setActivities((prev) => prev.filter((a) => a.cheeseTypeId !== id));
      } else {
        localCheeses.delete(id);
        setCheeseTypes((prev) => prev.filter((c) => c.id !== id));
        
        // Elimina anche le attività associate
        for (const activity of relatedActivities) {
          localActivities.delete(activity.id);
        }
        setActivities((prev) => prev.filter((a) => a.cheeseTypeId !== id));
      }
    } catch (error: any) {
      console.error('[deleteCheeseType] ❌ Error deleting cheese:', error);
      const errorMessage = error?.message || 'Errore sconosciuto';
      
      if (isProduction) {
        toast.error(`Errore critico nell'eliminazione: ${errorMessage}. Il formaggio NON è stato eliminato.`);
        throw error; // Rilancia l'errore
      } else {
        // Solo in sviluppo, fallback
        toast.error('Errore nell\'eliminazione del formaggio. Eliminato in locale come fallback.');
        localCheeses.delete(id);
        setCheeseTypes((prev) => prev.filter((c) => c.id !== id));
        
        // Elimina anche le attività associate in caso di errore
        const relatedActivities = activities.filter(
          a => a.cheeseTypeId === id
        );
        for (const activity of relatedActivities) {
          localActivities.delete(activity.id);
        }
        setActivities((prev) => prev.filter((a) => a.cheeseTypeId !== id));
      }
    }
  }, [useSupabase, activities]);

  // ============================================
  // PRODUCTION OPERATIONS
  // ============================================
  const addProduction = useCallback(async (production: Omit<Production, "id" | "createdAt" | "totalLiters">) => {
    const totalLiters = production.cheeses.reduce((sum, c) => sum + c.liters, 0);
    
    // ✅ NON generare l'ID per Supabase - lascia che lo generi il database
    const newProduction = {
      ...production,
      totalLiters,
      createdAt: new Date(),
      // ❌ RIMOSSO: id: generateUUID(),
    };

    try {
      let savedProduction: Production;
      if (useSupabase) {
        console.log('[addProduction] Attempting to save to Supabase:', { 
          productionNumber: newProduction.productionNumber, 
          totalLiters: newProduction.totalLiters 
        });
        
        savedProduction = await saveProduction(newProduction); // Supabase genererà l'UUID
        console.log('[addProduction] ✅ Successfully saved to Supabase:', savedProduction.id);
        
        // ❌ RIMOSSO: setProductions((prev) => [...prev, savedProduction]);
        // La real-time subscription aggiungerà automaticamente la produzione
      } else {
        // Solo in sviluppo locale - qui genera l'ID
        const productionWithId = {
          ...newProduction,
          id: generateUUID(),
        } as Production;
        console.log('[addProduction] Using localStorage (development mode)');
        localProductions.add(productionWithId);
        setProductions((prev) => [...prev, productionWithId]);
        savedProduction = productionWithId;
      }

      // Genera automaticamente le attività del protocollo per ogni formaggio
      const protocolActivities: Omit<Activity, "id" | "createdAt">[] = [];
      
      for (const productionCheese of production.cheeses) {
        const cheeseType = cheeseTypes.find(ct => ct.id === productionCheese.cheeseTypeId);
        if (!cheeseType || !cheeseType.protocol || cheeseType.protocol.length === 0) {
          continue; // Salta se il formaggio non ha protocollo
        }

        // Crea un'attività per ogni step del protocollo
        for (const protocolStep of cheeseType.protocol) {
          const productionDate = new Date(production.date);
          productionDate.setHours(0, 0, 0, 0);
          
          const activityDate = addDays(productionDate, protocolStep.day);
          activityDate.setHours(0, 0, 0, 0);
          
          const activityTitle = protocolStep.activity;
          const activityDescription = `Lotto: ${production.productionNumber} | ${productionCheese.liters}L`;

          // ✅ NON includere id e createdAt - saveActivity li gestirà
          const protocolActivity: Omit<Activity, "id" | "createdAt"> = {
            // ❌ RIMOSSO: id: generateUUID(),
            // ❌ RIMOSSO: createdAt: new Date(),
            title: activityTitle,
            description: activityDescription,
            date: activityDate,
            type: 'protocol',
            productionId: savedProduction.id,
            cheeseTypeId: cheeseType.id,
            completed: false,
          };

          protocolActivities.push(protocolActivity);
        }
      }

      // Salva tutte le attività del protocollo
      for (const protocolActivity of protocolActivities) {
        try {
          if (useSupabase) {
            const savedActivity = await saveActivity(protocolActivity);
            console.log('[addProduction] ✅ Protocol activity created:', savedActivity.title, 'on', format(savedActivity.date, 'yyyy-MM-dd'));
            
            // ❌ RIMOSSO: setActivities - la subscription lo fa automaticamente
            // setActivities((prev) => {
            //   const exists = prev.some(a => a.id === savedActivity.id);
            //   if (exists) return prev;
            //   return [...prev, savedActivity];
            // });
          } else {
            // Solo localStorage - qui genera l'ID
            const activityWithId = {
              ...protocolActivity,
              id: generateUUID(),
              createdAt: new Date(),
            } as Activity;
            localActivities.add(activityWithId);
            setActivities((prev) => {
              const exists = prev.some(a => a.id === activityWithId.id);
              if (exists) return prev;
              return [...prev, activityWithId];
            });
            console.log('[addProduction] ✅ Protocol activity created:', activityWithId.title, 'on', format(activityWithId.date, 'yyyy-MM-dd'));
          }
        } catch (error: any) {
          console.error('[addProduction] ❌ Error creating protocol activity:', error, protocolActivity);
          if (isProduction) {
            toast.error(`Errore nel salvataggio dell'attività del protocollo: ${protocolActivity.title}`);
            throw error;
          }
          // In sviluppo, continua anche se c'è un errore
        }
      }

      return savedProduction;
    } catch (error: any) {
      console.error('[addProduction] ❌ Error adding production:', error);
      const errorMessage = error?.message || 'Errore sconosciuto';
      
      if (isProduction) {
        // In produzione, NON fare fallback - mostra errore e NON salvare
        toast.error(`Errore critico nel salvataggio della produzione: ${errorMessage}. La produzione NON è stata salvata.`);
        throw error; // Rilancia l'errore per impedire il salvataggio
      } else {
        // Solo in sviluppo, fallback a localStorage
        const productionWithId = {
          ...newProduction,
          id: generateUUID(),
        } as Production;
        toast.error('Errore nel salvataggio della produzione. Salvato in locale come fallback.');
        localProductions.add(productionWithId);
        setProductions((prev) => [...prev, productionWithId]);
        return productionWithId;
      }
    }
  }, [useSupabase, cheeseTypes]);

  const updateProduction = useCallback(async (id: string, updates: Partial<Production>) => {
    try {
      if (useSupabase) {
        const current = productions.find(p => p.id === id);
        if (!current) return;
        const updated = { ...current, ...updates };
        if (updates.cheeses) {
          updated.totalLiters = updates.cheeses.reduce((sum, c) => sum + c.liters, 0);
        }
        const saved = await saveProduction(updated);
        setProductions((prev) =>
          prev.map((p) => (p.id === id ? saved : p))
        );
      } else {
        localProductions.update(id, updates);
        setProductions((prev) =>
          prev.map((p) => {
            if (p.id === id) {
              const updated = { ...p, ...updates };
              if (updates.cheeses) {
                updated.totalLiters = updates.cheeses.reduce((sum, c) => sum + c.liters, 0);
              }
              return updated;
            }
            return p;
          })
        );
      }
    } catch (error) {
      console.error('Error updating production:', error);
      toast.error('Errore nell\'aggiornamento della produzione');
      localProductions.update(id, updates);
      setProductions((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const updated = { ...p, ...updates };
            if (updates.cheeses) {
              updated.totalLiters = updates.cheeses.reduce((sum, c) => sum + c.liters, 0);
            }
            return updated;
          }
          return p;
        })
      );
    }
  }, [useSupabase, productions]);

  const deleteProduction = useCallback(async (id: string) => {
    try {
      // Trova tutte le attività associate a questa produzione (non solo quelle di protocollo)
      const relatedActivities = activities.filter(
        a => a.productionId === id
      );

      // Elimina la produzione
      if (useSupabase) {
        await deleteProductionFromSupabase(id);
        setProductions((prev) => prev.filter((p) => p.id !== id));
        
        // Elimina anche tutte le attività associate
        for (const activity of relatedActivities) {
          try {
            await deleteActivityFromSupabase(activity.id);
          } catch (err) {
            console.error('Error deleting related activity:', err);
          }
        }
        setActivities((prev) => prev.filter((a) => a.productionId !== id));
      } else {
        localProductions.delete(id);
        setProductions((prev) => prev.filter((p) => p.id !== id));
        
        // Elimina anche tutte le attività associate
        for (const activity of relatedActivities) {
          localActivities.delete(activity.id);
        }
        setActivities((prev) => prev.filter((a) => a.productionId !== id));
      }
    } catch (error) {
      console.error('Error deleting production:', error);
      toast.error('Errore nell\'eliminazione della produzione');
      localProductions.delete(id);
      setProductions((prev) => prev.filter((p) => p.id !== id));
      
      // Elimina anche tutte le attività associate in caso di errore
      const relatedActivities = activities.filter(
        a => a.productionId === id
      );
      for (const activity of relatedActivities) {
        localActivities.delete(activity.id);
      }
      setActivities((prev) => prev.filter((a) => a.productionId !== id));
    }
  }, [useSupabase, activities]);

  // ============================================
  // ACTIVITY OPERATIONS
  // ============================================
  const addActivity = useCallback(async (activity: Omit<Activity, "id" | "createdAt">) => {
    try {
      if (useSupabase) {
        // ❌ BUG FIX: NON passare l'ID a saveActivity per nuove attività
        // saveActivity controlla se activity.id esiste per decidere tra INSERT e UPDATE
        // Se passiamo un ID, fa UPDATE invece di INSERT → errore PGRST116
        console.log('[addActivity] Attempting to save to Supabase (new activity, no ID):', { 
          title: activity.title, 
          type: activity.type 
        });
        
        // Passa l'attività SENZA ID - saveActivity genererà l'UUID
        // createdAt viene gestito da saveActivity
        const saved = await saveActivity(activity);
        
        console.log('[addActivity] ✅ Successfully saved to Supabase:', saved.id);
        
        // ❌ BUG FIX: NON aggiungere manualmente l'attività allo stato
        // La real-time subscription la aggiungerà automaticamente quando riceve l'evento INSERT
        // Se aggiungiamo manualmente, l'attività viene aggiunta due volte:
        // 1. Manualmente qui
        // 2. Dalla real-time subscription
        // setActivities((prev) => [...prev, saved]); // ❌ RIMOSSO
        
        // La subscription gestirà l'aggiornamento dello stato
        // Aspetta un momento per permettere alla subscription di processare l'evento
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return saved;
      } else {
        // Solo in sviluppo locale - qui possiamo generare l'ID
        const newActivity: Activity = {
          ...activity,
          id: generateUUID(),
          createdAt: new Date(),
        };
        console.log('[addActivity] Using localStorage (development mode)');
        localActivities.add(newActivity);
        setActivities((prev) => [...prev, newActivity]);
        return newActivity;
      }
    } catch (error: any) {
      console.error('[addActivity] ❌ Error adding activity:', error);
      const errorMessage = error?.message || 'Errore sconosciuto';
      
      if (isProduction) {
        // In produzione, NON fare fallback - mostra errore e NON salvare
        toast.error(`Errore critico nel salvataggio dell'attività: ${errorMessage}. L'attività NON è stata salvata.`);
        throw error; // Rilancia l'errore per impedire il salvataggio
      } else {
        // Solo in sviluppo, fallback a localStorage
        const newActivity: Activity = {
          ...activity,
          id: generateUUID(),
          createdAt: new Date(),
        };
        toast.error('Errore nel salvataggio dell\'attività. Salvato in locale come fallback.');
        localActivities.add(newActivity);
        setActivities((prev) => [...prev, newActivity]);
        return newActivity;
      }
    }
  }, [useSupabase]);

  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>) => {
    try {
      if (useSupabase) {
        const current = activities.find(a => a.id === id);
        if (!current) return;
        const updated = await saveActivity({ ...current, ...updates, id });
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? updated : a))
        );
      } else {
        localActivities.update(id, updates);
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
        );
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Errore nell\'aggiornamento dell\'attività');
      localActivities.update(id, updates);
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
    }
  }, [useSupabase, activities]);

  const toggleActivity = useCallback(async (id: string, date?: Date) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    // Per attività ricorrenti, usa completedDates per tracciare il completamento per data
    if (activity.recurrence && activity.recurrence !== 'none' && activity.type === 'recurring') {
      const dateStr = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const completedDates = activity.completedDates || [];
      const isCompletedForDate = completedDates.includes(dateStr);
      
      const newCompletedDates = isCompletedForDate
        ? completedDates.filter(d => d !== dateStr)
        : [...completedDates, dateStr];

      try {
        if (useSupabase) {
          // Per Supabase, aggiorna l'attività con completedDates
          const current = activities.find(a => a.id === id);
          if (!current) return;
          const updated = await saveActivity({ ...current, completedDates: newCompletedDates, id });
          setActivities((prev) =>
            prev.map((a) => (a.id === id ? updated : a))
          );
        } else {
          localActivities.toggleDate(id, dateStr);
          setActivities((prev) =>
            prev.map((a) => (a.id === id ? { ...a, completedDates: newCompletedDates } : a))
          );
        }
      } catch (error) {
        console.error('Error toggling activity:', error);
        toast.error('Errore nell\'aggiornamento dell\'attività');
        localActivities.toggleDate(id, dateStr);
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, completedDates: newCompletedDates } : a))
        );
      }
    } else {
      // Per attività one-time e protocol, usa completed normale
      const newCompleted = !activity.completed;

      try {
        if (useSupabase) {
          const updated = await toggleActivityCompleted(id, newCompleted);
          setActivities((prev) =>
            prev.map((a) => (a.id === id ? updated : a))
          );
        } else {
          localActivities.toggle(id);
          setActivities((prev) =>
            prev.map((a) => (a.id === id ? { ...a, completed: newCompleted } : a))
          );
        }
      } catch (error) {
        console.error('Error toggling activity:', error);
        toast.error('Errore nell\'aggiornamento dell\'attività');
        localActivities.toggle(id);
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, completed: newCompleted } : a))
        );
      }
    }
  }, [useSupabase, activities, updateActivity]);

  const deleteActivity = useCallback(async (id: string) => {
    try {
      if (useSupabase) {
        await deleteActivityFromSupabase(id);
        setActivities((prev) => prev.filter((a) => a.id !== id));
      } else {
        localActivities.delete(id);
        setActivities((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error: any) {
      console.error('[deleteActivity] ❌ Error deleting activity:', error);
      const errorMessage = error?.message || 'Errore sconosciuto';
      
      if (isProduction) {
        toast.error(`Errore critico nell'eliminazione: ${errorMessage}. L'attività NON è stata eliminata.`);
        throw error; // Rilancia l'errore
      } else {
        // Solo in sviluppo, fallback
        toast.error('Errore nell\'eliminazione dell\'attività. Eliminata in locale come fallback.');
        localActivities.delete(id);
        setActivities((prev) => prev.filter((a) => a.id !== id));
      }
    }
  }, [useSupabase]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getActivitiesForDate = useCallback((date: Date) => {
    // Normalizza la data di confronto a mezzanotte
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    const filtered = activities.filter((a) => {
      if (!a.date) return false;
      
      // Normalizza anche la data dell'attività
      const activityDate = new Date(a.date);
      activityDate.setHours(0, 0, 0, 0);
      
      // Attività one-time o protocol: solo se è lo stesso giorno
      if (!a.recurrence || a.recurrence === 'none' || a.type === 'protocol') {
        return isSameDay(activityDate, normalizedDate);
      }
      
      // Attività ricorrenti: controlla se deve apparire in questa data
      if (normalizedDate < activityDate) {
        return false; // Non mostrare date prima della creazione
      }
      
      switch (a.recurrence) {
        case 'daily':
          // Ogni giorno dalla data di creazione in poi
          return true;
        
        case 'weekly':
          // Solo lo stesso giorno della settimana (es. solo martedì se creata di martedì)
          return activityDate.getDay() === normalizedDate.getDay();
        
        case 'monthly':
          // Solo lo stesso giorno del mese
          return activityDate.getDate() === normalizedDate.getDate();
        
        case 'quarterly':
          // Ogni 3 mesi, stesso giorno del mese
          const monthsDiff = (normalizedDate.getFullYear() - activityDate.getFullYear()) * 12 + 
                            (normalizedDate.getMonth() - activityDate.getMonth());
          return monthsDiff >= 0 && monthsDiff % 3 === 0 && 
                 activityDate.getDate() === normalizedDate.getDate();
        
        case 'semiannual':
          // Ogni 6 mesi, stesso giorno del mese
          const monthsDiffSem = (normalizedDate.getFullYear() - activityDate.getFullYear()) * 12 + 
                               (normalizedDate.getMonth() - activityDate.getMonth());
          return monthsDiffSem >= 0 && monthsDiffSem % 6 === 0 && 
                 activityDate.getDate() === normalizedDate.getDate();
        
        case 'annual':
          // Ogni anno, stesso giorno e mese
          return activityDate.getMonth() === normalizedDate.getMonth() && 
                 activityDate.getDate() === normalizedDate.getDate();
        
        default:
          return isSameDay(activityDate, normalizedDate);
      }
    });
    
    return filtered;
  }, [activities]);

  const getProductionsForDate = useCallback((date: Date) => {
    return productions.filter((p) => isSameDay(p.date, date));
  }, [productions]);

  const getProductionsForMonth = useCallback((date: Date) => {
    return productions.filter((p) => isSameMonth(p.date, date));
  }, [productions]);

  const getMonthlyStats = useCallback((year: number): MonthlyStats[] => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map((monthDate) => {
      const monthProductions = productions.filter(
        (p) => getMonth(p.date) === getMonth(monthDate) && getYear(p.date) === year
      );

      const cheeseBreakdown = cheeseTypes.map((cheese) => ({
        cheeseTypeId: cheese.id,
        liters: monthProductions.reduce((sum, prod) => {
          const cheeseProd = prod.cheeses.find((c) => c.cheeseTypeId === cheese.id);
          return sum + (cheeseProd?.liters || 0);
        }, 0),
      })).filter(c => c.liters > 0);

      return {
        month: getMonth(monthDate),
        year,
        totalLiters: monthProductions.reduce((sum, p) => sum + p.totalLiters, 0),
        productions: monthProductions.length,
        cheeseBreakdown,
      };
    });
  }, [productions, cheeseTypes]);

  const getCheeseType = useCallback((id: string) => {
    return cheeseTypes.find((c) => c.id === id);
  }, [cheeseTypes]);

  // ============================================
  // SYNC LOCALSTORAGE (solo in sviluppo)
  // ============================================
  useEffect(() => {
    if (!useSupabase) {
      localCheeses.save(cheeseTypes);
    }
  }, [cheeseTypes, useSupabase]);

  useEffect(() => {
    if (!useSupabase) {
      localProductions.save(productions);
    }
  }, [productions, useSupabase]);

  useEffect(() => {
    if (!useSupabase) {
      localActivities.save(activities);
    }
  }, [activities, useSupabase]);

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
    updateActivity,
    toggleActivity,
    deleteActivity,
    getActivitiesForDate,

    // Stats
    getMonthlyStats,
  };
}

// Export default come fallback per compatibilità
export default useData;
