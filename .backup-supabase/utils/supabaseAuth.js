import { supabase } from './supabase'

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  if (!supabase) {
    return { success: false, error: 'Supabase non configurato' }
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return { success: true, user: data.user, session: data.session }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: error.message || 'Errore durante l\'accesso' }
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  if (!supabase) {
    return { success: false, error: 'Supabase non configurato' }
  }
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get current session
 */
export function getSession() {
  if (!supabase) {
    return Promise.resolve({ data: { session: null }, error: null })
  }
  return supabase.auth.getSession()
}

/**
 * Get current user
 */
export function getCurrentUser() {
  if (!supabase) {
    return Promise.resolve({ data: { user: null }, error: null })
  }
  return supabase.auth.getUser()
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  if (!supabase) {
    return false
  }
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
  if (!supabase) {
    // Se Supabase non è configurato, chiama il callback con session null
    callback('SIGNED_OUT', null)
    return { data: { subscription: null }, unsubscribe: () => {} }
  }
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

/**
 * Reset password (send reset email)
 */
export async function resetPassword(email) {
  if (!supabase) {
    return { success: false, error: 'Supabase non configurato' }
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    return { success: false, error: error.message || 'Errore durante il reset password' }
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword) {
  if (!supabase) {
    return { success: false, error: 'Supabase non configurato' }
  }
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Update password error:', error)
    return { success: false, error: error.message || 'Errore durante l\'aggiornamento password' }
  }
}
