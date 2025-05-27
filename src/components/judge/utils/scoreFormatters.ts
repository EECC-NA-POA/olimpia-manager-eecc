
export const formatScoreValue = (
  score: {
    valor_pontuacao?: number | null;
    unidade?: string;
  },
  type: 'time' | 'distance' | 'points'
): string => {
  if (type === 'time' && score.valor_pontuacao !== undefined) {
    // Convert total seconds back to mm:ss.SSS format for display
    const totalSeconds = score.valor_pontuacao || 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds % 1) * 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
  
  if (type === 'distance') {
    return `${score.valor_pontuacao?.toFixed(2) || 0} m`;
  }
  
  // Default to points
  return `${score.valor_pontuacao || 0} pts`;
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
