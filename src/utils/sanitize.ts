/**
 * Sanitizes HTML input to prevent XSS by escaping special characters.
 * @param {string | null | undefined} input - The raw input string.
 * @returns {string} The sanitized string.
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (input == null) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
