
export interface ParsedValue {
  numericValue: number;
  originalValue: string;
  format: 'tempo' | 'distancia' | 'pontos' | 'number';
}

export function parseValueByFormat(value: string, format?: string): ParsedValue {
  if (!format || !value) {
    return {
      numericValue: Number(value) || 0,
      originalValue: value,
      format: 'number'
    };
  }

  switch (format) {
    case 'tempo':
      return parseTimeValue(value);
    case 'distancia':
      return parseDistanceValue(value);
    case 'pontos':
      return parsePointsValue(value);
    default:
      return {
        numericValue: Number(value) || 0,
        originalValue: value,
        format: 'number'
      };
  }
}

function parseTimeValue(value: string): ParsedValue {
  // Formato esperado: HH:MM:SS
  const timeParts = value.split(':');
  let totalSeconds = 0;

  if (timeParts.length >= 1) {
    totalSeconds += (parseInt(timeParts[0]) || 0) * 3600; // horas
  }
  if (timeParts.length >= 2) {
    totalSeconds += (parseInt(timeParts[1]) || 0) * 60; // minutos
  }
  if (timeParts.length >= 3) {
    totalSeconds += parseInt(timeParts[2]) || 0; // segundos
  }

  return {
    numericValue: totalSeconds,
    originalValue: value,
    format: 'tempo'
  };
}

function parseDistanceValue(value: string): ParsedValue {
  // Formato esperado: ##,## m
  const cleanValue = value.replace(/[^\d,]/g, '');
  const parts = cleanValue.split(',');
  
  let meters = parseInt(parts[0]) || 0;
  let centimeters = parseInt(parts[1]) || 0;
  
  // Converter para metros totais
  const totalMeters = meters + (centimeters / 100);

  return {
    numericValue: totalMeters,
    originalValue: value,
    format: 'distancia'
  };
}

function parsePointsValue(value: string): ParsedValue {
  // Formato esperado: ###.##
  const cleanValue = value.replace(/[^\d.]/g, '');
  const numericValue = parseFloat(cleanValue) || 0;

  return {
    numericValue: numericValue,
    originalValue: value,
    format: 'pontos'
  };
}

export function formatValueForDisplay(numericValue: number, format: string): string {
  switch (format) {
    case 'tempo':
      return formatTimeFromSeconds(numericValue);
    case 'distancia':
      return formatDistanceFromMeters(numericValue);
    case 'pontos':
      return numericValue.toFixed(2);
    default:
      return numericValue.toString();
  }
}

function formatTimeFromSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatDistanceFromMeters(totalMeters: number): string {
  const meters = Math.floor(totalMeters);
  const centimeters = Math.round((totalMeters - meters) * 100);

  return `${meters},${centimeters.toString().padStart(2, '0')} m`;
}
