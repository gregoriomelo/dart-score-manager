/**
 * Utility functions for time formatting and manipulation
 */

/**
 * Formats a timestamp into a readable time string
 * @param timestamp - The timestamp to format
 * @returns A formatted time string (HH:MM:SS)
 */
export const formatTime = (timestamp: Date): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};
