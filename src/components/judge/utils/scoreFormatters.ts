export const formatScoreValue = (
  score: {
    valor_pontuacao?: number | string | null;
    unidade?: string;
  },
  type: 'time' | 'distance' | 'points'
): string => {
  if (type === 'time' && score.valor_pontuacao !== undefined) {
    // If valor_pontuacao is already a string in mm:ss.SSS format, return it
    if (typeof score.valor_pontuacao === 'string' && score.valor_pontuacao.includes(':')) {
      return score.valor_pontuacao;
    }
    
    // If it's a number (legacy format), convert from total seconds to mm:ss.SSS format
    if (typeof score.valor_pontuacao === 'number') {
      const totalSeconds = score.valor_pontuacao || 0;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const milliseconds = Math.floor((totalSeconds % 1) * 1000);
      
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    
    // Fallback
    return '00:00.000';
  }
  
  if (type === 'distance') {
    const numValue = typeof score.valor_pontuacao === 'number' ? score.valor_pontuacao : parseFloat(score.valor_pontuacao as string) || 0;
    return `${numValue.toFixed(2)} m`;
  }
  
  // Default to points
  const numValue = typeof score.valor_pontuacao === 'number' ? score.valor_pontuacao : parseFloat(score.valor_pontuacao as string) || 0;
  return `${numValue} pts`;
};

export const parseTimeToMilliseconds = (
  minutes: number = 0,
  seconds: number = 0,
  milliseconds: number = 0
): number => {
  return (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
};

export const calculateTimeFromMilliseconds = (totalMilliseconds: number): {
  minutes: number;
  seconds: number;
  milliseconds: number;
} => {
  const minutes = Math.floor(totalMilliseconds / (60 * 1000));
  const seconds = Math.floor((totalMilliseconds % (60 * 1000)) / 1000);
  const milliseconds = totalMilliseconds % 1000;
  
  return { minutes, seconds, milliseconds };
};

export const formatMedal = (position: number | null): string | null => {
  if (!position) return null;
  
  switch (position) {
    case 1:
      return 'ouro';
    case 2:
      return 'prata';
    case 3:
      return 'bronze';
    default:
      return null;
  }
};
