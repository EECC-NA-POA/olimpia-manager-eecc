
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
  // Formato esperado: MM:SS.mmm
  let totalMilliseconds = 0;

  if (value.includes(':') && value.includes('.')) {
    const [minutesSeconds, milliseconds] = value.split('.');
    const [minutes, seconds] = minutesSeconds.split(':');
    
    totalMilliseconds += (parseInt(minutes) || 0) * 60 * 1000; // minutos para ms
    totalMilliseconds += (parseInt(seconds) || 0) * 1000; // segundos para ms
    totalMilliseconds += parseInt(milliseconds) || 0; // milissegundos
  } else if (value.includes(':')) {
    const [minutes, seconds] = value.split(':');
    totalMilliseconds += (parseInt(minutes) || 0) * 60 * 1000;
    totalMilliseconds += (parseInt(seconds) || 0) * 1000;
  } else {
    totalMilliseconds = parseInt(value) || 0;
  }

  return {
    numericValue: totalMilliseconds,
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
      return formatTimeFromMilliseconds(numericValue);
    case 'distancia':
      return formatDistanceFromMeters(numericValue);
    case 'pontos':
      return numericValue.toFixed(2);
    default:
      return numericValue.toString();
  }
}

function formatTimeFromMilliseconds(totalMilliseconds: number): string {
  const minutes = Math.floor(totalMilliseconds / (60 * 1000));
  const seconds = Math.floor((totalMilliseconds % (60 * 1000)) / 1000);
  const milliseconds = totalMilliseconds % 1000;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

function formatDistanceFromMeters(totalMeters: number): string {
  const meters = Math.floor(totalMeters);
  const centimeters = Math.round((totalMeters - meters) * 100);

  return `${meters},${centimeters.toString().padStart(2, '0')} m`;
}
