/**
 * Genera IDs únicos compatibles con selectores CSS.
 * @param {string} prefix - Prefijo para el ID generado
 * @returns {string} ID único
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
};
