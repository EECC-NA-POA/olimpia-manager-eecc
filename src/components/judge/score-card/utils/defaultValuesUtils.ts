
export function getDefaultValues(initialValues: any, rule: any) {
  console.log('getDefaultValues - initialValues:', initialValues);
  console.log('getDefaultValues - rule:', rule);
  
  if (initialValues) {
    console.log('getDefaultValues - returning initial values');
    return initialValues;
  }

  const defaults: any = {
    notes: '',
  };

  if (!rule) {
    console.log('getDefaultValues - no rule, returning basic defaults');
    return {
      ...defaults,
      score: 0,
    };
  }

  // Handle tempo type with baterias
  if (rule.regra_tipo === 'tempo' && rule.parametros?.baterias) {
    console.log('getDefaultValues - tempo with baterias');
    defaults.heat = 1; // Default to first bateria
    defaults.lane = 1; // Default to first lane
    defaults.minutes = 0;
    defaults.seconds = 0;
    defaults.milliseconds = 0;
  }
  // Handle other tempo types
  else if (rule.regra_tipo === 'tempo') {
    console.log('getDefaultValues - tempo without baterias');
    defaults.minutes = 0;
    defaults.seconds = 0;
    defaults.milliseconds = 0;
  }
  // Handle distance type
  else if (rule.regra_tipo === 'distancia') {
    console.log('getDefaultValues - distancia');
    defaults.meters = 0;
    defaults.centimeters = 0;
    if (rule.parametros?.baterias) {
      defaults.heat = 1;
      defaults.lane = 1;
    }
  }
  // Handle points type
  else if (rule.regra_tipo === 'pontos' || rule.regra_tipo === 'sets' || rule.regra_tipo === 'arrows') {
    console.log('getDefaultValues - pontos/sets/arrows');
    defaults.score = 0;
    if (rule.parametros?.baterias) {
      defaults.heat = 1;
      defaults.lane = 1;
    }
  }
  // Fallback for unknown types
  else {
    console.log('getDefaultValues - fallback');
    defaults.score = 0;
  }

  console.log('getDefaultValues - final defaults:', defaults);
  return defaults;
}
