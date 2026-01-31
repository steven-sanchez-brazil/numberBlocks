/**
 * Calcula los anchos válidos (divisores) para un bloque numérico.
 * Un ancho es válido si el bloque puede formar un rectángulo con altura <= 12 y ancho <= 10.
 * @param {number} value - Valor del bloque
 * @returns {number[]} Array de anchos válidos ordenados
 */
export const getValidWidths = (value) => {
  if (value === 1) return [1];
  const widths = [];
  const MAX_HEIGHT = 12;
  const MAX_WIDTH = 10;
  const minWidthRequiredByHeight = Math.ceil(value / MAX_HEIGHT);
  for (let i = minWidthRequiredByHeight; i <= Math.min(value, MAX_WIDTH); i++) {
    if (value % i === 0) {
      const h = value / i;
      if (h <= MAX_HEIGHT && h >= 2) widths.push(i);
    }
  }
  if (widths.length === 0) {
      if (value <= MAX_WIDTH) return [1];
      return [minWidthRequiredByHeight || 2];
  }
  return widths;
};
