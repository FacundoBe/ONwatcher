/**
 * Convierte un número al formato de moneda Argentina (AR) sin símbolo de moneda ni espacios.
 * @param {number|string} valor - El número a formatear ej 1250.0
 * @returns {string} - El valor formateado (ej: 1.250,50)
 */
export const formatearMoneda = (valor) => {
  // 1. Aseguramos que sea un número
  const numero = parseFloat(valor);

  // 2. Validamos que sea un número válido (ahora devolvemos solo el número)
  if (isNaN(numero)) return "0,00";

  // 3. Aplicamos el formato regional como decimal
  return new Intl.NumberFormat('es-AR', {
    style: 'decimal', // Cambiado de 'currency' a 'decimal'
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
};