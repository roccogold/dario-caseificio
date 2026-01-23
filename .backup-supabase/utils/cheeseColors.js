// Palette di colori disponibili per i formaggi (15 colori) - palette calda e leggera
export const CHEESE_COLORS = [
  { name: 'Giallo', value: '#F4D03F', hex: '#F4D03F' },
  { name: 'Arancione', value: '#F8A978', hex: '#F8A978' },
  { name: 'Rosso', value: '#E8A5A5', hex: '#E8A5A5' },
  { name: 'Rosa', value: '#F5B7B1', hex: '#F5B7B1' },
  { name: 'Viola', value: '#C9A9DD', hex: '#C9A9DD' },
  { name: 'Blu', value: '#A8C8EC', hex: '#A8C8EC' },
  { name: 'Azzurro', value: '#AED6F1', hex: '#AED6F1' },
  { name: 'Verde', value: '#A9DFBF', hex: '#A9DFBF' },
  { name: 'Verde Scuro', value: '#85C1A5', hex: '#85C1A5' },
  { name: 'Turchese', value: '#A3E4D7', hex: '#A3E4D7' },
  { name: 'Marrone', value: '#D2B48C', hex: '#D2B48C' },
  { name: 'Beige', value: '#F5E6D3', hex: '#F5E6D3' },
  { name: 'Indaco', value: '#B19CD9', hex: '#B19CD9' },
  { name: 'Corallo', value: '#F5B5A5', hex: '#F5B5A5' },
  { name: 'Lavanda', value: '#E6D3F5', hex: '#E6D3F5' },
]

// Validazione colori per formaggi specifici
export const CHEESE_COLOR_RULES = {
  // Formaggi che devono avere un colore specifico
  required: {},
  // Formaggi che non possono avere certi colori
  forbidden: {
    'Pecorino': ['#F4D03F'], // Pecorino non può essere giallo
  }
}

// Ottiene i colori disponibili per un formaggio specifico
export const getAvailableColors = (cheeseName) => {
  const name = cheeseName?.trim() || ''
  
  // Se il formaggio ha un colore richiesto, restituisci solo quello
  if (CHEESE_COLOR_RULES.required[name]) {
    return CHEESE_COLORS.filter(c => c.hex === CHEESE_COLOR_RULES.required[name])
  }
  
  // Se il formaggio ha colori vietati, escludili
  const forbiddenColors = CHEESE_COLOR_RULES.forbidden[name] || []
  return CHEESE_COLORS.filter(c => !forbiddenColors.includes(c.hex))
}

// Valida se un colore può essere usato per un formaggio
export const validateCheeseColor = (cheeseName, colorHex) => {
  const name = cheeseName?.trim() || ''
  
  // Controlla se il formaggio ha un colore richiesto
  if (CHEESE_COLOR_RULES.required[name]) {
    return colorHex === CHEESE_COLOR_RULES.required[name]
  }
  
  // Controlla se il colore è vietato per questo formaggio
  const forbiddenColors = CHEESE_COLOR_RULES.forbidden[name] || []
  return !forbiddenColors.includes(colorHex)
}

// Ottiene il colore predefinito per un formaggio
export const getDefaultColor = (cheeseName) => {
  const name = cheeseName?.trim() || ''
  
  if (CHEESE_COLOR_RULES.required[name]) {
    return CHEESE_COLOR_RULES.required[name]
  }
  
  // Restituisci il primo colore disponibile
  const available = getAvailableColors(name)
  return available.length > 0 ? available[0].hex : CHEESE_COLORS[0].hex
}
