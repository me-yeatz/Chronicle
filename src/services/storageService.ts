// Storage Service for Chronicle
// Handles localStorage with proper quota management and user notifications

export interface StorageResult {
  success: boolean;
  error?: 'QUOTA_EXCEEDED' | 'STORAGE_UNAVAILABLE' | 'UNKNOWN';
  message?: string;
}

export interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
  usedFormatted: string;
  totalFormatted: string;
}

// localStorage keys
export const STORAGE_KEYS = {
  EVENTS: 'chronicle_events',
  CREDENTIALS: 'chronicle_credentials',
  USER_PROFILE: 'chronicle_user_profile',
  CATEGORIES: 'chronicle_categories',
  NOTES: 'chronicle_notes',
  AI_CHAT_HISTORY: 'chronicle_ai_chat',
} as const;

// Format bytes to human readable
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Check if localStorage is available
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Get storage usage information
export const getStorageInfo = (): StorageInfo => {
  let used = 0;

  // Calculate total size of all localStorage items
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      // Each character in JavaScript strings is 2 bytes (UTF-16)
      used += (localStorage.getItem(key)?.length || 0) * 2;
      // Add key length
      used += key.length * 2;
    }
  }

  // Estimate total available (browsers typically allow 5-10MB, we'll use 5MB as safe estimate)
  const total = 5 * 1024 * 1024; // 5MB in bytes
  const percentage = Math.round((used / total) * 100);

  return {
    used,
    total,
    percentage: Math.min(percentage, 100),
    usedFormatted: formatBytes(used),
    totalFormatted: formatBytes(total),
  };
};

// Get Chronicle-specific storage usage
export const getChronicleStorageInfo = (): { [key: string]: string } => {
  const info: { [key: string]: string } = {};

  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const data = localStorage.getItem(key);
    if (data) {
      info[name] = formatBytes(data.length * 2);
    } else {
      info[name] = '0 B';
    }
  });

  return info;
};

// Load data from localStorage with fallback
export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    if (!isStorageAvailable()) {
      console.warn('localStorage is not available');
      return fallback;
    }
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return fallback;
  }
};

// Save data to localStorage with proper error handling
export const saveToStorage = <T>(key: string, data: T): StorageResult => {
  try {
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'STORAGE_UNAVAILABLE',
        message: 'Local storage is not available in your browser.',
      };
    }

    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);

    return { success: true };
  } catch (error) {
    // Check if it's a quota exceeded error
    if (error instanceof DOMException) {
      if (
        error.code === 22 || // Legacy Chrome
        error.code === 1014 || // Firefox
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      ) {
        return {
          success: false,
          error: 'QUOTA_EXCEEDED',
          message: 'Storage is full. Please delete some old events or clear data in Settings to free up space.',
        };
      }
    }

    return {
      success: false,
      error: 'UNKNOWN',
      message: 'Failed to save data. Please try again.',
    };
  }
};

// Remove item from localStorage
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

// Clear all Chronicle data
export const clearAllChronicleData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
};

// Check if storage is getting full (> 80%)
export const isStorageNearFull = (): boolean => {
  const info = getStorageInfo();
  return info.percentage >= 80;
};

// Check if storage is critically full (> 95%)
export const isStorageCritical = (): boolean => {
  const info = getStorageInfo();
  return info.percentage >= 95;
};

// Export all data as JSON for backup
export const exportAllData = (): string => {
  const data: { [key: string]: unknown } = {};

  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        data[name] = JSON.parse(stored);
      } catch {
        data[name] = stored;
      }
    }
  });

  return JSON.stringify(data, null, 2);
};

// Import data from backup
export const importData = (jsonData: string): StorageResult => {
  try {
    const data = JSON.parse(jsonData);

    // Validate and import each key
    if (data.EVENTS) {
      const result = saveToStorage(STORAGE_KEYS.EVENTS, data.EVENTS);
      if (!result.success) return result;
    }
    if (data.CREDENTIALS) {
      const result = saveToStorage(STORAGE_KEYS.CREDENTIALS, data.CREDENTIALS);
      if (!result.success) return result;
    }
    if (data.USER_PROFILE) {
      const result = saveToStorage(STORAGE_KEYS.USER_PROFILE, data.USER_PROFILE);
      if (!result.success) return result;
    }
    if (data.CATEGORIES) {
      const result = saveToStorage(STORAGE_KEYS.CATEGORIES, data.CATEGORIES);
      if (!result.success) return result;
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: 'UNKNOWN',
      message: 'Invalid backup file format.',
    };
  }
};
