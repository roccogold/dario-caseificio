import CryptoJS from 'crypto-js'

// Encryption key - generated from domain and a secret
// This makes it harder to decrypt data from other domains
const getEncryptionKey = () => {
  const domain = typeof window !== 'undefined' ? window.location.hostname : 'default'
  const baseKey = 'corzano-paterno-2026-secure-key'
  // Combine domain with base key to make it domain-specific
  return `${baseKey}-${domain}-cheese-production`
}
const ENCRYPTION_KEY = getEncryptionKey()

/**
 * Hash a password (simplified version - in production use proper bcrypt)
 */
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString()
}

/**
 * Encrypt sensitive data
 */
export const encryptData = (data) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    return null
  }
}

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

/**
 * Generate a secure token for password reset
 */
export const generateResetToken = () => {
  return CryptoJS.lib.WordArray.random(32).toString()
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const session = localStorage.getItem('auth_session')
  if (!session) return false
  
  try {
    const sessionData = JSON.parse(session)
    // Check if session is expired (24 hours)
    if (Date.now() > sessionData.expires) {
      localStorage.removeItem('auth_session')
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Get current user from session
 */
export const getCurrentUser = () => {
  const session = localStorage.getItem('auth_session')
  if (!session) return null
  
  try {
    const sessionData = JSON.parse(session)
    if (Date.now() > sessionData.expires) {
      localStorage.removeItem('auth_session')
      return null
    }
    return sessionData.user
  } catch {
    return null
  }
}

/**
 * Create a session
 */
export const createSession = (user) => {
  const sessionData = {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user'
    },
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }
  localStorage.setItem('auth_session', JSON.stringify(sessionData))
}

/**
 * Clear session (logout)
 */
export const clearSession = () => {
  localStorage.removeItem('auth_session')
}
