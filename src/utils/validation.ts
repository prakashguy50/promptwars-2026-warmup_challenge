/**
 * Validates if a string is a properly formatted email.
 * @param {string} email - The email to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if a string is empty or only contains whitespace.
 * @param {string | null | undefined} input - The string to check.
 * @returns {boolean} True if empty, false otherwise.
 */
export const isEmpty = (input: string | null | undefined): boolean => {
  return !input || input.trim().length === 0;
};

/**
 * Checks if a number is within a specific range (inclusive).
 * @param {number} num - The number to check.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {boolean} True if within bounds, false otherwise.
 */
export const isWithinBounds = (num: number, min: number, max: number): boolean => {
  return typeof num === 'number' && !isNaN(num) && num >= min && num <= max;
};

/**
 * Checks if a string length is within a specific range (inclusive).
 * @param {string} str - The string to check.
 * @param {number} min - The minimum allowed length.
 * @param {number} max - The maximum allowed length.
 * @returns {boolean} True if valid length, false otherwise.
 */
export const isValidLength = (str: string, min: number, max: number): boolean => {
  if (!str) return min === 0;
  return str.length >= min && str.length <= max;
};
