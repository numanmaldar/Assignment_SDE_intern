/**
 * Generates a unique identifier with a given prefix.
 * @param {string} prefix - The prefix for the ID (e.g., 'sale', 'tx').
 * @returns {string} The unique ID.
 */
function generateId(prefix) {
    return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

module.exports = { generateId };