import { format } from 'date-fns'
import it from 'date-fns/locale/it'

/**
 * Formats a date with Italian locale and capitalizes the first letter of each word
 * (day names and month names)
 * @param {Date} date - The date to format
 * @param {string} formatString - The format string (e.g., "EEEE d MMMM yyyy")
 * @returns {string} - Formatted date with day and month names capitalized
 */
export const formatDateCapitalized = (date, formatString) => {
  const formatted = format(date, formatString, { locale: it })
  // Capitalize first letter of the string
  // Then capitalize any lowercase letter that comes after a space (for month names)
  return formatted
    .split(' ')
    .map((word, index) => {
      // If it's the first word or if the word starts with a lowercase letter (not a number)
      if (index === 0 || (word.length > 0 && /^[a-zàèéìíîòóùú]/.test(word))) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(' ')
}
