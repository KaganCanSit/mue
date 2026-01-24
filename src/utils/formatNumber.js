/**
 * Convert language code from Mue format (en_US) to locale format (en-US)
 */
export function getLocaleCode() {
  return localStorage.getItem('language')?.replace(/_/g, '-') || 'en-GB';
}

/**
 * Format number with locale awareness (if enabled)
 * @param {number} value - The number to format
 * @param {Intl.NumberFormatOptions} options - Optional Intl.NumberFormat options
 * @returns {string} Formatted number string
 */
export function formatNumber(value, options = {}) {
  if (localStorage.getItem('localeFormatting') !== 'true') {
    return String(value);
  }
  try {
    return new Intl.NumberFormat(getLocaleCode(), options).format(value);
  } catch {
    return String(value);
  }
}

/**
 * Format percentage with locale awareness (if enabled)
 * @param {number} value - The decimal value (e.g., 0.45 for 45%)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value) {
  if (localStorage.getItem('localeFormatting') !== 'true') {
    return Math.round(value * 100) + '%';
  }
  try {
    return new Intl.NumberFormat(getLocaleCode(), {
      style: 'percent',
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return Math.round(value * 100) + '%';
  }
}
