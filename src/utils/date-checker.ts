/**
 * Simple Date Availability Checker
 *
 * Returns availability for a requested date or suggests alternative dates.
 */

// Define the date availability interface
interface DateAvailability {
  available: boolean;
  alternatives?: string[];
  message?: string;
  suggestedTimes?: Date[];
  isExactAvailable?: boolean;
}

/**
 * Generate available time slots based on a date
 * @param {Date} date - Date object
 * @returns {Array<Date>} - Array of available time slot Date objects
 */
function getAvailableTimeSlots(date: Date) {
  // Extract values from the date to use as "random" seeds
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Use date components to create a "seed" for our pseudo-randomness
  const dateSeed = day + month + (year % 100);

  // Business hours from 9 AM to 5 PM
  const possibleHours = [9, 10, 11, 12, 13, 14, 15, 16];
  const possibleMinutes = [0, 30];

  // Array to store our available slots
  const availableSlots: Date[] = [];

  // Determine if this date is available at all (roughly 80% chance)
  const isDateAvailable = dateSeed % 5 !== 0;

  if (!isDateAvailable) {
    return []; // Return empty array if date is not available
  }

  // Determine how many slots will be available (between 3 and 5)
  const numberOfSlots = 3 + (dateSeed % 3);

  // Generate the available slots based on the date seed
  possibleHours.forEach((hour) => {
    // Skip some hours based on the date to create "randomness"
    if ((hour + dateSeed) % 3 === 0) {
      return;
    }

    possibleMinutes.forEach((minute) => {
      // Skip some minutes based on the date to create "randomness"
      if ((minute + day) % 2 === 0 && hour % 2 === 1) {
        return;
      }

      // Create a new Date object for this time slot
      const timeSlot = new Date(date);
      timeSlot.setHours(hour, minute, 0, 0);

      // Add the time slot to our available slots
      availableSlots.push(timeSlot);
    });
  });

  // Ensure we don't have too many slots by limiting to our numberOfSlots
  return availableSlots.slice(0, numberOfSlots);
}

/**
 * Gets neighboring dates (1-3 days before and after the requested date)
 * @param {Date} date - The requested date
 * @returns {Array<Date>} - Array of neighboring dates
 */
function getNeighboringDates(date: Date) {
  const neighbors = [];

  // Get up to 3 days before and 3 days after
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue; // Skip the original date

    const neighborDate = new Date(date);
    neighborDate.setDate(date.getDate() + i);
    neighbors.push(neighborDate);
  }

  return neighbors;
}

/**
 * Format a Date object to a human-readable string
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDateForHumans(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();
  
  // Add appropriate suffix to day of month
  let suffix = 'th';
  if (dayOfMonth === 1 || dayOfMonth === 21 || dayOfMonth === 31) {
    suffix = 'st';
  } else if (dayOfMonth === 2 || dayOfMonth === 22) {
    suffix = 'nd';
  } else if (dayOfMonth === 3 || dayOfMonth === 23) {
    suffix = 'rd';
  }
  
  // Format the time part
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert 24-hour format to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  // Pad minutes with leading zero if needed
  const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
  
  return `${dayName}, ${monthName} ${dayOfMonth}${suffix}, ${year} at ${hours}:${minutesStr} ${ampm}`;
}

/**
 * Check availability and return formatted results
 * @param {Date|string} dateInput - Date to check
 * @returns {DateAvailability} - Object with availability information
 */
export function checkDateAvailability(dateInput: unknown): DateAvailability {
  try {
    // Handle the case when dateInput is null or undefined
    if (!dateInput) {
      return {
        available: false,
        message: "No date provided. Please specify a date and time for checking availability."
      };
    }
    
    // Convert to date object if string was passed
    const date = typeof dateInput === "string" ? new Date(dateInput as string) : new Date(dateInput as Date);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return {
        available: false,
        message: "Invalid date format. Please provide a valid date."
      };
    }
    
    // Get available slots for the requested date
    const exactDaySlots = getAvailableTimeSlots(new Date(date));
    const isExactAvailable = exactDaySlots.length > 0;
    
    // If the exact day is available, return its slots
    if (isExactAvailable) {
      const formattedAlternatives = exactDaySlots.map(slot => formatDateForHumans(slot));
      
      return {
        available: true,
        isExactAvailable: true,
        suggestedTimes: exactDaySlots,
        alternatives: formattedAlternatives,
        message: `The requested time is available for an appointment. We also have the following times available on the same day: ${formattedAlternatives.join(', ')}`
      };
    }
    
    // If the exact day is not available, check neighboring days
    const neighboringDates = getNeighboringDates(date);
    let suggestedTimes: Date[] = [];
    
    // Check each neighboring date for availability
    for (const neighborDate of neighboringDates) {
      const neighborSlots = getAvailableTimeSlots(neighborDate);
      suggestedTimes = suggestedTimes.concat(neighborSlots);
      
      // If we have at least 5 suggestions, stop looking
      if (suggestedTimes.length >= 5) break;
    }
    
    // Sort the suggested times chronologically
    suggestedTimes.sort((a, b) => a.valueOf() - b.valueOf());
    
    // Limit to a reasonable number of suggestions
    suggestedTimes = suggestedTimes.slice(0, 5);
    
    if (suggestedTimes.length === 0) {
      return {
        available: false,
        isExactAvailable: false,
        message: "Unfortunately, we don't have any available time slots in the next few days. Please try a different week."
      };
    }
    
    const formattedAlternatives = suggestedTimes.map(slot => formatDateForHumans(slot));
    
    return {
      available: false,
      isExactAvailable: false,
      suggestedTimes: suggestedTimes,
      alternatives: formattedAlternatives,
      message: `The requested time is not available. Here are some alternative times we can offer: ${formattedAlternatives.join(', ')}`
    };
  } catch (error) {
    console.error("Error checking date availability:", error);
    return {
      available: false,
      message: "There was an error processing your requested date. Please try a different format."
    };
  }
}