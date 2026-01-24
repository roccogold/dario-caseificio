import { hashPassword, encryptData, decryptData } from './auth'

const USERS_STORAGE_KEY = 'cheese_production_users'
const RESET_TOKENS_STORAGE_KEY = 'cheese_production_reset_tokens'

/**
 * Initialize default admin user if no users exist
 * For demo: always ensure default user exists
 */
export const initializeUsers = () => {
  const users = getUsers()
  // Use environment variables for default credentials (development only)
  // In production, use Supabase Auth
  const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME || 'admin@example.com'
  const defaultPassword = import.meta.env.VITE_DEFAULT_PASSWORD || 'changeme'
  
  // Check if default user already exists
  let defaultUser = users.find(u => u.username === defaultUsername)
  
  if (defaultUser) {
    // Default user exists, make sure password is correct
    const correctHash = hashPassword(defaultPassword)
    if (defaultUser.passwordHash !== correctHash) {
      defaultUser.passwordHash = correctHash
      saveUsers(users)
    }
    return defaultUser
  }
  
  // Migration: If old 'test' user exists, remove it and create new default user
  const oldTestUser = users.find(u => u.username === 'test')
  if (oldTestUser) {
    // Remove old test user
    const updatedUsers = users.filter(u => u.username !== 'test')
    
    // Create new default user
    const newDefaultUser = {
      id: oldTestUser.id || '1', // Keep same ID if possible
      username: defaultUsername,
      passwordHash: hashPassword(defaultPassword),
      email: defaultUsername,
      role: 'admin',
      createdAt: oldTestUser.createdAt || new Date().toISOString(),
      passwordChanged: false
    }
    
    updatedUsers.push(newDefaultUser)
    saveUsers(updatedUsers)
    return newDefaultUser
  }
  
  // Create default user (either no users exist, or default user doesn't exist)
  const newDefaultUser = {
    id: '1',
    username: defaultUsername,
    passwordHash: hashPassword(defaultPassword),
    email: defaultUsername,
    role: 'admin',
    createdAt: new Date().toISOString(),
    passwordChanged: false
  }
  
  // If no users exist, create array with default user
  // If users exist but default doesn't, add default user
  if (users.length === 0) {
    saveUsers([newDefaultUser])
  } else {
    users.push(newDefaultUser)
    saveUsers(users)
  }
  
  return newDefaultUser
}

/**
 * Get all users (decrypted)
 */
export const getUsers = () => {
  try {
    const encrypted = localStorage.getItem(USERS_STORAGE_KEY)
    if (!encrypted) return []
    
    const decrypted = decryptData(encrypted)
    if (!decrypted) {
      // If decryption fails, try to clear and start fresh
      console.warn('Failed to decrypt users, clearing storage')
      localStorage.removeItem(USERS_STORAGE_KEY)
      return []
    }
    return decrypted
  } catch (error) {
    console.error('Error getting users:', error)
    // Clear corrupted data
    localStorage.removeItem(USERS_STORAGE_KEY)
    return []
  }
}

/**
 * Save users (encrypted)
 */
export const saveUsers = (users) => {
  try {
    const encrypted = encryptData(users)
    if (encrypted) {
      localStorage.setItem(USERS_STORAGE_KEY, encrypted)
      return true
    }
    return false
  } catch (error) {
    console.error('Error saving users:', error)
    return false
  }
}

/**
 * Find user by username
 */
export const findUserByUsername = (username) => {
  const users = getUsers()
  return users.find(u => u.username === username)
}

/**
 * Find user by email (case-insensitive)
 */
export const findUserByEmail = (email) => {
  const users = getUsers()
  const normalizedEmail = email?.toLowerCase().trim()
  return users.find(u => u.email?.toLowerCase().trim() === normalizedEmail)
}

/**
 * Find user by ID
 */
export const findUserById = (id) => {
  const users = getUsers()
  return users.find(u => u.id === id)
}

/**
 * Create a new user
 */
export const createUser = (userData) => {
  const users = getUsers()
  
  // Check if username or email already exists
  if (users.find(u => u.username === userData.username)) {
    return { success: false, error: 'Username already exists' }
  }
  if (users.find(u => u.email === userData.email)) {
    return { success: false, error: 'Email already exists' }
  }
  
  const newUser = {
    id: Date.now().toString(),
    username: userData.username,
    passwordHash: hashPassword(userData.password),
    email: userData.email,
    role: userData.role || 'user',
    createdAt: new Date().toISOString(),
    passwordChanged: false
  }
  
  users.push(newUser)
  if (saveUsers(users)) {
    return { success: true, user: newUser }
  }
  return { success: false, error: 'Failed to save user' }
}

/**
 * Update user password
 */
export const updateUserPassword = (userId, newPassword) => {
  const users = getUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) {
    return { success: false, error: 'User not found' }
  }
  
  users[userIndex].passwordHash = hashPassword(newPassword)
  users[userIndex].passwordChanged = true
  
  if (saveUsers(users)) {
    return { success: true }
  }
  return { success: false, error: 'Failed to update password' }
}

/**
 * Verify user password
 */
export const verifyPassword = (username, password) => {
  const user = findUserByUsername(username)
  if (!user) return { success: false, error: 'User not found' }
  
  const passwordHash = hashPassword(password)
  if (user.passwordHash === passwordHash) {
    return { success: true, user }
  }
  return { success: false, error: 'Invalid password' }
}

/**
 * Save password reset token
 */
export const saveResetToken = (email, token) => {
  try {
    const tokens = getResetTokens()
    tokens.push({
      email,
      token,
      expires: Date.now() + (60 * 60 * 1000) // 1 hour
    })
    localStorage.setItem(RESET_TOKENS_STORAGE_KEY, JSON.stringify(tokens))
    return true
  } catch (error) {
    console.error('Error saving reset token:', error)
    return false
  }
}

/**
 * Get reset tokens
 */
export const getResetTokens = () => {
  try {
    const tokens = localStorage.getItem(RESET_TOKENS_STORAGE_KEY)
    return tokens ? JSON.parse(tokens) : []
  } catch {
    return []
  }
}

/**
 * Verify and consume reset token
 */
export const verifyResetToken = (email, token) => {
  const tokens = getResetTokens()
  const now = Date.now()
  
  // Remove expired tokens
  const validTokens = tokens.filter(t => t.expires > now)
  localStorage.setItem(RESET_TOKENS_STORAGE_KEY, JSON.stringify(validTokens))
  
  const tokenData = validTokens.find(
    t => t.email === email && t.token === token
  )
  
  if (tokenData) {
    // Remove used token
    const remainingTokens = validTokens.filter(
      t => !(t.email === email && t.token === token)
    )
    localStorage.setItem(RESET_TOKENS_STORAGE_KEY, JSON.stringify(remainingTokens))
    return true
  }
  
  return false
}
