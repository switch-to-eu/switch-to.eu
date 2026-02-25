/**
 * Time utility functions for handling time slots and formatting
 */

/**
 * Generate time slots based on start time and duration
 * @param startTime - Start time in HH:MM format (e.g., "09:00")
 * @param durationHours - Duration in hours (1, 2, 3, etc.)
 * @returns Array of time slots in 30-minute intervals
 */
export function generateTimeSlots(startTime: string, durationHours: number): string[] {
  const slots: string[] = [];
  
  // Parse start time
  const timeParts = startTime.split(':').map(Number);
  if (timeParts.length !== 2 || timeParts[0] === undefined || timeParts[1] === undefined) {
    throw new Error('Invalid time format. Expected HH:MM');
  }
  
  const [startHour, startMinute] = timeParts;
  
  // Calculate total 30-minute slots
  const totalSlots = durationHours * 2; // 2 slots per hour
  
  for (let i = 0; i < totalSlots; i++) {
    const totalMinutes = startHour * 60 + startMinute + (i * 30);
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    
    // Format as HH:MM
    const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    slots.push(timeSlot);
  }
  
  return slots;
}

/**
 * Format time slot for display
 * @param time - Time in HH:MM format
 * @returns Formatted time string
 */
export function formatTimeSlot(time: string): string {
  return time; // Already in 24h format, no additional formatting needed
}

/**
 * Validate if the time range is valid (doesn't exceed 24:00)
 * @param start - Start time in HH:MM format
 * @param duration - Duration in hours
 * @returns True if valid, false otherwise
 */
export function isValidTimeRange(start: string, duration: number): boolean {
  const timeParts = start.split(':').map(Number);
  if (timeParts.length !== 2 || timeParts[0] === undefined || timeParts[1] === undefined) {
    return false;
  }
  
  const [startHour, startMinute] = timeParts;
  const startTotalMinutes = startHour * 60 + startMinute;
  const durationMinutes = duration * 60;
  const endTotalMinutes = startTotalMinutes + durationMinutes;
  
  // Check if end time exceeds 24:00 (1440 minutes)
  return endTotalMinutes <= 1440;
}

/**
 * Calculate end time based on start time and duration (handles past-midnight times)
 * @param start - Start time in HH:MM format
 * @param duration - Duration in hours
 * @returns End time in HH:MM format (may be >24:00 if past midnight)
 */
export function calculateEndTime(start: string, duration: number): string {
  const timeParts = start.split(':').map(Number);
  if (timeParts.length !== 2 || timeParts[0] === undefined || timeParts[1] === undefined) {
    throw new Error('Invalid time format. Expected HH:MM');
  }
  
  const [startHour, startMinute] = timeParts;
  const startTotalMinutes = startHour * 60 + startMinute;
  const durationMinutes = duration * 60;
  const endTotalMinutes = startTotalMinutes + durationMinutes;
  
  // Allow times past 24:00 (will show as 25:00, 26:00, etc. for next-day times)
  const endHour = Math.floor(endTotalMinutes / 60);
  const endMinute = endTotalMinutes % 60;
  
  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}

/**
 * Generate time slots from multiple start times with fixed duration
 * @param startTimes - Array of start times in HH:MM format (e.g., ["09:00", "14:00"])
 * @param durationHours - Duration in hours applied to each start time
 * @returns Array of time slot ranges (e.g., ["09:00-11:00", "14:00-16:00"])
 */
export function generateTimeSlotsFromStartTimes(startTimes: string[], durationHours: number): string[] {
  return startTimes.map(startTime => formatTimeSlotRange(startTime, durationHours));
}

/**
 * Format a time slot range from start time and duration
 * @param startTime - Start time in HH:MM format
 * @param durationHours - Duration in hours
 * @returns Formatted time range (e.g., "09:00-11:00")
 */
export function formatTimeSlotRange(startTime: string, durationHours: number): string {
  const endTime = calculateEndTime(startTime, durationHours);
  return `${startTime}-${endTime}`;
}

/**
 * Validate multiple start times (only checks for duplicates - overlaps and past-midnight are now allowed)
 * @param startTimes - Array of start times
 * @param duration - Duration in hours (unused but kept for compatibility)
 * @returns True if no duplicate start times exist
 */
export function validateStartTimesWithDuration(startTimes: string[], duration: number): boolean {
  // Only check for duplicates - overlaps and past-midnight are now allowed
  const uniqueTimes = new Set(startTimes);
  return uniqueTimes.size === startTimes.length;
}

/**
 * Get all available start times in 15-minute intervals
 * @returns Array of all possible start times from 00:00 to 23:45
 */
export function getAvailableStartTimes(): string[] {
  const times: string[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  
  return times;
}

/**
 * Helper function to convert time string to minutes
 * @param time - Time in HH:MM format
 * @returns Total minutes from 00:00
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}