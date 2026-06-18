/**
 * Get appropriate greeting based on the time of day
 * @returns Time of day greeting (Morning, Afternoon, or Evening)
 */
export function getTimeOfDay(): string {
  if (typeof window === 'undefined') {
    // For server-side rendering, use UTC time as a fallback
    const hour = new Date().getUTCHours();
    
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  }
  
  // For client-side, use local time
  const hour = new Date().getHours();
  
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

/**
 * Format a date to a readable string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Get the current date as a formatted string
 */
export function getCurrentDate(): string {
  return formatDate(new Date());
} 