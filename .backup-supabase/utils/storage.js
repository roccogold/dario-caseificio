import { encryptData, decryptData } from './auth'

const STORAGE_KEY = 'cheese-production-diary-encrypted'

export const loadData = () => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY)
    if (!encrypted) {
      return { cheeses: [], productions: [], activities: [], completedActivities: {} }
    }
    
    // Try to decrypt the data
    const decrypted = decryptData(encrypted)
    if (decrypted) {
      return decrypted
    }
    
    // Fallback: try to parse as plain JSON (for migration from unencrypted data)
    try {
      const data = JSON.parse(encrypted)
      // If successful, encrypt it for future use
      if (data.cheeses || data.productions || data.activities) {
        saveData(data)
        return data
      }
    } catch {
      // Not valid JSON either
    }
    
    return { cheeses: [], productions: [], activities: [], completedActivities: {} }
  } catch (error) {
    console.error('Error loading data:', error)
    return { cheeses: [], productions: [], activities: [], completedActivities: {} }
  }
}

export const saveData = (data) => {
  try {
    // Encrypt the data before storing
    const encrypted = encryptData(data)
    if (encrypted) {
      localStorage.setItem(STORAGE_KEY, encrypted)
    } else {
      console.error('Failed to encrypt data')
    }
  } catch (error) {
    console.error('Error saving data:', error)
  }
}

// Export encryption functions for use in other modules
export { encryptData, decryptData }
