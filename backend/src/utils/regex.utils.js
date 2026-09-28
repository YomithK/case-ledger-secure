/**
 * Escape regular-expression metacharacters so user input is matched literally
 * when used in a MongoDB $regex query (prevents ReDoS and pattern-based enumeration).
 * @param {*} value - User-supplied search value
 * @returns {string} Escaped string safe to use as a literal regex pattern
 */
export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
