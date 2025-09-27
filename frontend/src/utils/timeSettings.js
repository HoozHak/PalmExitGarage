// Time Settings Utility - Manages custom time/date settings with timezone support
// Saves to localStorage and handles automatic DST conversion

const TIME_SETTINGS_KEY = 'palm_exit_time_settings';

// Get list of common timezones
export const getCommonTimezones = () => [
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Phoenix',
  'America/Detroit',
  'America/Indianapolis',
  'America/Halifax',
  'America/Toronto',
  'America/Winnipeg',
  'America/Edmonton',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Cancun',
  'America/Guatemala',
  'America/Belize',
  'America/Costa_Rica',
  'America/Panama'
];

// Default time settings
const defaultSettings = {
  useCustomTime: false,
  customDate: '',
  customTime: '',
  timezone: 'America/New_York', // Default to Eastern Time
  autoDetectTimezone: true,
  enableDST: true
};

// Load settings from localStorage
export const loadTimeSettings = () => {
  try {
    const saved = localStorage.getItem(TIME_SETTINGS_KEY);
    if (saved) {
      const settings = JSON.parse(saved);
      
      // Auto-detect timezone if enabled
      if (settings.autoDetectTimezone) {
        settings.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      
      return { ...defaultSettings, ...settings };
    }
  } catch (error) {
    console.error('Error loading time settings:', error);
  }
  
  // Return default with auto-detected timezone
  const settings = { ...defaultSettings };
  if (settings.autoDetectTimezone) {
    settings.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  
  return settings;
};

// Save settings to localStorage
export const saveTimeSettings = (settings) => {
  try {
    localStorage.setItem(TIME_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving time settings:', error);
    return false;
  }
};

// Get current time based on settings
export const getCurrentTime = (settings = null) => {
  const timeSettings = settings || loadTimeSettings();
  
  // If custom time is disabled, return current system time
  if (!timeSettings.useCustomTime) {
    return new Date();
  }
  
  // If using custom time, construct date from custom settings
  if (timeSettings.customDate && timeSettings.customTime) {
    try {
      const dateTime = `${timeSettings.customDate}T${timeSettings.customTime}`;
      const customDate = new Date(dateTime);
      
      // If timezone is specified and different from system, adjust
      if (timeSettings.timezone) {
        const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeSettings.timezone !== systemTimezone) {
          // Create date in the specified timezone
          const tempDate = new Date(customDate.toLocaleString("en-US", {timeZone: timeSettings.timezone}));
          const tempDate2 = new Date(customDate.toLocaleString("en-US"));
          return new Date(customDate.getTime() + (tempDate2.getTime() - tempDate.getTime()));
        }
      }
      
      return customDate;
    } catch (error) {
      console.error('Error parsing custom date/time:', error);
      return new Date(); // Fallback to current time
    }
  }
  
  // Fallback to current time
  return new Date();
};

// Format time for display in the current timezone
export const formatTimeForDisplay = (date = null, settings = null) => {
  const timeSettings = settings || loadTimeSettings();
  const currentDate = date || getCurrentTime(timeSettings);
  
  const options = {
    timeZone: timeSettings.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  return currentDate.toLocaleString('en-US', options);
};

// Get timezone display name
export const getTimezoneDisplayName = (timezone) => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;
    
    return `${timezone.replace('_', ' ')} (${timeZoneName})`;
  } catch (error) {
    return timezone;
  }
};

// Check if timezone observes DST
export const timeZoneObservesDST = (timezone) => {
  const january = new Date(2024, 0, 1);
  const july = new Date(2024, 6, 1);
  
  const janOffset = january.toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' });
  const julOffset = july.toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' });
  
  return janOffset !== julOffset;
};

// Convert date to ISO string for input fields
export const toInputDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
};

// Get formatted timestamp for work orders
export const getWorkOrderTimestamp = (settings = null) => {
  const currentTime = getCurrentTime(settings);
  const timeSettings = settings || loadTimeSettings();
  
  // Format as ISO string with timezone information
  const isoString = currentTime.toISOString();
  
  // Add timezone and DST information
  const timezoneInfo = {
    timezone: timeSettings.timezone,
    isDST: timeSettings.enableDST && isDateInDST(currentTime, timeSettings.timezone),
    originalTimestamp: isoString,
    displayTime: formatTimeForDisplay(currentTime, timeSettings)
  };
  
  return {
    timestamp: isoString,
    displayTime: timezoneInfo.displayTime,
    timezone: timeSettings.timezone,
    timezoneInfo
  };
};

// Check if a date is in DST for a given timezone
export const isDateInDST = (date, timezone) => {
  try {
    const january = new Date(date.getFullYear(), 0, 1);
    const july = new Date(date.getFullYear(), 6, 1);
    
    const janOffset = getTimezoneOffset(january, timezone);
    const julOffset = getTimezoneOffset(july, timezone);
    
    const currentOffset = getTimezoneOffset(date, timezone);
    
    return Math.min(janOffset, julOffset) === currentOffset;
  } catch (error) {
    return false;
  }
};

// Helper function to get timezone offset
const getTimezoneOffset = (date, timezone) => {
  const utc = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const local = date.toLocaleString('en-US', { timeZone: timezone });
  return (Date.parse(utc) - Date.parse(local)) / (1000 * 60);
};

export default {
  loadTimeSettings,
  saveTimeSettings,
  getCurrentTime,
  formatTimeForDisplay,
  getTimezoneDisplayName,
  getCommonTimezones,
  timeZoneObservesDST,
  toInputDateTime,
  getWorkOrderTimestamp,
  isDateInDST
};