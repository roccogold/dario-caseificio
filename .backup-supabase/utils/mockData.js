import { addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'

// Cheese type colors that complement the earthy palette (matching existing palette)
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

// Mock cheese types matching the application structure
export const mockCheeseTypes = [
  {
    id: '1',
    name: 'Pecorino Toscano',
    color: '#D2B48C', // Marrone
    yieldLitersPerKg: 0.12,
    pricePerKg: 18.5,
    protocol: [
      { day: 1, activity: 'Salatura' },
      { day: 2, activity: 'Prima rivoltatura' },
      { day: 7, activity: 'Controllo stagionatura' },
      { day: 30, activity: 'Pronto per vendita fresco' },
      { day: 90, activity: 'Stagionato' },
    ],
  },
  {
    id: '2',
    name: 'Ricotta Fresca',
    color: '#F5E6D3', // Beige
    yieldLitersPerKg: 0.18,
    pricePerKg: 8.0,
    protocol: [
      { day: 0, activity: 'Confezionamento' },
      { day: 1, activity: 'Pronta per vendita' },
    ],
  },
  {
    id: '3',
    name: 'Caciotta',
    color: '#F8A978', // Arancione
    yieldLitersPerKg: 0.13,
    pricePerKg: 14.0,
    protocol: [
      { day: 1, activity: 'Salatura' },
      { day: 3, activity: 'Prima rivoltatura' },
      { day: 15, activity: 'Pronta per vendita' },
    ],
  },
  {
    id: '4',
    name: 'Mozzarella di Bufala',
    color: '#AED6F1', // Azzurro
    yieldLitersPerKg: 0.14,
    pricePerKg: 16.0,
    protocol: [
      { day: 0, activity: 'Filatura' },
      { day: 0, activity: 'Confezionamento in salamoia' },
      { day: 1, activity: 'Pronta per vendita' },
    ],
  },
  {
    id: '5',
    name: 'Raviggiolo',
    color: '#A9DFBF', // Verde
    yieldLitersPerKg: 0.15,
    pricePerKg: 12.0,
    protocol: [
      { day: 0, activity: 'Formatura' },
      { day: 1, activity: 'Pronto per vendita' },
    ],
  },
]

// Generate mock productions for the current month
const generateMockProductions = () => {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: today })

  return daysInMonth
    .filter((_, i) => i % 2 === 0) // Every other day
    .map((date, index) => {
      const cheeseIndex = index % mockCheeseTypes.length
      const cheese = mockCheeseTypes[cheeseIndex]
      const secondCheese = index % 3 === 0 ? mockCheeseTypes[(index + 1) % mockCheeseTypes.length] : null

      const cheeses = [
        {
          cheeseId: cheese.id,
          liters: 50 + Math.floor(Math.random() * 100),
        },
        ...(secondCheese
          ? [
              {
                cheeseId: secondCheese.id,
                liters: 30 + Math.floor(Math.random() * 50),
              },
            ]
          : []),
      ]

      const totalLiters = cheeses.reduce((sum, c) => sum + c.liters, 0)

      return {
        id: `prod-${index + 1}`,
        productionDate: format(date, 'yyyy-MM-dd'),
        productionNumber: `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(index + 1).padStart(3, '0')}`,
        cheeses,
        totalLiters,
        notes: index % 4 === 0 ? 'Latte particolarmente cremoso oggi' : '',
      }
    })
}

export const mockProductions = generateMockProductions()

// Generate mock activities
const today = new Date()
const todayStr = format(today, 'yyyy-MM-dd')

export const mockActivities = [
  {
    id: 'act-1',
    title: 'Controllo temperature celle',
    description: 'Verificare che le celle di stagionatura siano a 12-14°C',
    date: todayStr,
    recurrence: 'daily',
    isCompleted: false,
  },
  {
    id: 'act-2',
    title: 'Pulizia attrezzature',
    description: 'Sanificazione completa di tutti gli strumenti',
    date: todayStr,
    recurrence: 'daily',
    isCompleted: true,
  },
  {
    id: 'act-3',
    title: 'Ordine caglio',
    description: 'Contattare fornitore per nuovo ordine caglio',
    date: format(addDays(today, 2), 'yyyy-MM-dd'),
    recurrence: 'none',
    isCompleted: false,
  },
  {
    id: 'act-4',
    title: 'Controllo umidità',
    description: 'Verificare umidità relativa nelle celle (85-90%)',
    date: todayStr,
    recurrence: 'daily',
    isCompleted: false,
  },
]

// Helper function to initialize mock data
export const initializeMockData = () => {
  return {
    cheeses: mockCheeseTypes,
    productions: mockProductions,
    activities: mockActivities,
  }
}
