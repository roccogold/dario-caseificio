import { clsx } from 'clsx'

/**
 * Utility function to merge class names
 * Similar to cn() from shadcn/ui
 */
export function cn(...inputs) {
  return clsx(inputs)
}
