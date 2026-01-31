/**
 * Retorna el estilo visual de un Numberblock basado en su valor.
 * Los bloques 1-10 tienen colores específicos, el resto usa interpolación HSL.
 * @param {number} value - Valor del bloque (1-100)
 * @returns {Object} Objeto con propiedades bg, border y opcionalmente glow
 */
export const getBlockStyle = (value) => {
  if (value <= 10) {
    const config = {
      1: { bg: '#FF0000', border: 'rgba(0,0,0,0.15)' },
      2: { bg: '#FF8000', border: 'rgba(0,0,0,0.15)' },
      3: { bg: '#FFFF00', border: 'rgba(0,0,0,0.15)' },
      4: { bg: '#00FF00', border: 'rgba(0,0,0,0.15)' },
      5: { bg: '#00FFFF', border: 'rgba(0,0,0,0.15)' },
      6: { bg: '#8A2BE2', border: 'rgba(0,0,0,0.15)' },
      7: { bg: 'linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #0000ff)', border: 'rgba(0,0,0,0.15)' },
      8: { bg: '#FF69B4', border: 'rgba(0,0,0,0.15)' },
      9: { bg: '#C0C0C0', border: 'rgba(0,0,0,0.15)' },
      10: { bg: '#FFFFFF', border: '#FF0000' },
    };
    return config[value];
  }
  if (value === 100) return { bg: '#FFFFFF', border: '#FF0000', glow: '0 0 25px rgba(255,0,0,0.2)' };
  const tens = Math.floor(value / 10);
  const hue = (tens * 36) % 360;
  return { bg: `hsl(${hue}, 85%, 75%)`, border: value % 10 === 0 ? '#FF0000' : 'rgba(0,0,0,0.12)' };
};
