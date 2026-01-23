/**
 * Utility functions for predictive analysis and trend identification
 */

/**
 * Calculate average production per month for a given cheese
 */
export const calculateMonthlyAverage = (productions, cheeseId, months = 12) => {
  const cheeseProductions = productions.filter(prod => {
    if (!prod.cheeses || !Array.isArray(prod.cheeses)) return false
    return prod.cheeses.some(c => c.cheeseId === cheeseId)
  })

  if (cheeseProductions.length === 0) return 0

  const monthlyTotals = {}
  cheeseProductions.forEach(prod => {
    if (!prod.productionDate) return
    const [year, month] = prod.productionDate.split('-').map(Number)
    const monthKey = `${year}-${month}`
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { count: 0, liters: 0 }
    }
    
    const cheeseProd = prod.cheeses.find(c => c.cheeseId === cheeseId)
    if (cheeseProd) {
      monthlyTotals[monthKey].count += 1
      const liters = typeof cheeseProd.liters === 'number' 
        ? cheeseProd.liters 
        : (parseFloat(cheeseProd.liters) || 0)
      monthlyTotals[monthKey].liters += liters
    }
  })

  const monthsCount = Object.keys(monthlyTotals).length
  if (monthsCount === 0) return 0

  const totalLiters = Object.values(monthlyTotals).reduce((sum, m) => sum + m.liters, 0)
  return totalLiters / monthsCount
}

/**
 * Predict next month production based on historical data
 */
export const predictNextMonth = (productions, cheeseId) => {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Get last 6 months of data
  const last6Months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1)
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
    
    const monthProductions = productions.filter(prod => {
      if (!prod.productionDate || !prod.cheeses) return false
      const [year, month] = prod.productionDate.split('-').map(Number)
      return year === date.getFullYear() && month === date.getMonth() + 1
    })

    let monthLiters = 0
    monthProductions.forEach(prod => {
      const cheeseProd = prod.cheeses.find(c => c.cheeseId === cheeseId)
      if (cheeseProd) {
        const liters = typeof cheeseProd.liters === 'number' 
          ? cheeseProd.liters 
          : (parseFloat(cheeseProd.liters) || 0)
        monthLiters += liters
      }
    })

    last6Months.push(monthLiters)
  }

  // Simple moving average prediction
  const validMonths = last6Months.filter(v => v > 0)
  if (validMonths.length === 0) return null

  const average = validMonths.reduce((sum, v) => sum + v, 0) / validMonths.length
  
  // Trend calculation (simple linear regression)
  let trend = 0
  if (validMonths.length >= 2) {
    const firstHalf = validMonths.slice(0, Math.floor(validMonths.length / 2))
    const secondHalf = validMonths.slice(Math.floor(validMonths.length / 2))
    const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length
    trend = (secondAvg - firstAvg) / firstHalf.length
  }

  return {
    predicted: Math.max(0, Math.round(average + trend)),
    confidence: validMonths.length >= 3 ? 'high' : validMonths.length >= 2 ? 'medium' : 'low',
    trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
  }
}

/**
 * Get seasonal patterns for a cheese
 */
export const getSeasonalPattern = (productions, cheeseId) => {
  const monthlyData = {}
  
  productions.forEach(prod => {
    if (!prod.productionDate || !prod.cheeses) return
    const [year, month] = prod.productionDate.split('-').map(Number)
    
    const cheeseProd = prod.cheeses.find(c => c.cheeseId === cheeseId)
    if (cheeseProd) {
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 }
      }
      const liters = typeof cheeseProd.liters === 'number' 
        ? cheeseProd.liters 
        : (parseFloat(cheeseProd.liters) || 0)
      monthlyData[month].total += liters
      monthlyData[month].count += 1
    }
  })

  const monthlyAverages = {}
  Object.keys(monthlyData).forEach(month => {
    monthlyAverages[month] = monthlyData[month].total / monthlyData[month].count
  })

  // Find best and worst months
  const sortedMonths = Object.entries(monthlyAverages)
    .sort((a, b) => b[1] - a[1])
    .map(([month, avg]) => ({ month: parseInt(month), average: avg }))

  // Se c'è solo un mese con dati, bestMonth e worstMonth sono lo stesso
  // Se ci sono più mesi, bestMonth è il primo e worstMonth è l'ultimo
  const bestMonth = sortedMonths[0]?.month || null
  const worstMonth = sortedMonths.length > 1 
    ? sortedMonths[sortedMonths.length - 1]?.month 
    : bestMonth

  return {
    monthlyAverages,
    bestMonth,
    worstMonth,
    pattern: sortedMonths,
    hasMultipleMonths: sortedMonths.length > 1
  }
}

/**
 * Calculate performance metrics for a cheese
 */
export const calculateCheesePerformance = (productions, cheeseId, period = 'year') => {
  const now = new Date()
  let startDate, endDate

  if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1)
    endDate = new Date(now.getFullYear(), 11, 31)
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  } else {
    // Last 6 months
    startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  }

  const periodProductions = productions.filter(prod => {
    if (!prod.productionDate) return false
    const [year, month, day] = prod.productionDate.split('-').map(Number)
    const prodDate = new Date(year, month - 1, day)
    return prodDate >= startDate && prodDate <= endDate
  })

  let totalLiters = 0
  let productionCount = 0
  const monthlyData = {}

  periodProductions.forEach(prod => {
    const cheeseProd = prod.cheeses?.find(c => c.cheeseId === cheeseId)
    if (cheeseProd) {
      const liters = typeof cheeseProd.liters === 'number' 
        ? cheeseProd.liters 
        : (parseFloat(cheeseProd.liters) || 0)
      totalLiters += liters
      productionCount += 1

      const [year, month] = prod.productionDate.split('-').map(Number)
      const monthKey = `${year}-${month}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0
      }
      monthlyData[monthKey] += liters
    }
  })

  const avgPerProduction = productionCount > 0 ? totalLiters / productionCount : 0
  const monthsWithData = Object.keys(monthlyData).length
  const avgPerMonth = monthsWithData > 0 ? totalLiters / monthsWithData : 0

  // Calculate growth rate (compare first half vs second half)
  const monthKeys = Object.keys(monthlyData).sort()
  if (monthKeys.length >= 2) {
    const midPoint = Math.floor(monthKeys.length / 2)
    const firstHalf = monthKeys.slice(0, midPoint)
    const secondHalf = monthKeys.slice(midPoint)
    
    const firstHalfTotal = firstHalf.reduce((sum, key) => sum + monthlyData[key], 0)
    const secondHalfTotal = secondHalf.reduce((sum, key) => sum + monthlyData[key], 0)
    
    const firstHalfAvg = firstHalfTotal / firstHalf.length
    const secondHalfAvg = secondHalfTotal / secondHalf.length
    
    const growthRate = firstHalfAvg > 0 
      ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 
      : 0

    return {
      totalLiters,
      productionCount,
      avgPerProduction,
      avgPerMonth,
      growthRate: Math.round(growthRate * 10) / 10,
      trend: growthRate > 5 ? 'strong-growth' : growthRate > 0 ? 'growth' : growthRate < -5 ? 'decline' : 'stable',
      monthlyData
    }
  }

  return {
    totalLiters,
    productionCount,
    avgPerProduction,
    avgPerMonth,
    growthRate: 0,
    trend: 'stable',
    monthlyData
  }
}

/**
 * Compare two periods
 */
export const comparePeriods = (productions, cheeseId, period1, period2) => {
  const perf1 = calculateCheesePerformance(productions, cheeseId, period1)
  const perf2 = calculateCheesePerformance(productions, cheeseId, period2)

  const litersChange = perf2.totalLiters - perf1.totalLiters
  const litersChangePercent = perf1.totalLiters > 0 
    ? ((litersChange / perf1.totalLiters) * 100) 
    : 0

  const productionChange = perf2.productionCount - perf1.productionCount
  const productionChangePercent = perf1.productionCount > 0 
    ? ((productionChange / perf1.productionCount) * 100) 
    : 0

  return {
    period1: perf1,
    period2: perf2,
    litersChange: Math.round(litersChange),
    litersChangePercent: Math.round(litersChangePercent * 10) / 10,
    productionChange,
    productionChangePercent: Math.round(productionChangePercent * 10) / 10
  }
}

/**
 * Get optimal production suggestions based on seasonality
 */
export const getOptimalProductionSuggestions = (productions, cheeses) => {
  const now = new Date()
  const currentMonth = now.getMonth() + 1

  const suggestions = cheeses.map(cheese => {
    const pattern = getSeasonalPattern(productions, cheese.id)
    const prediction = predictNextMonth(productions, cheese.id)
    
    // Check if current month is optimal
    const isOptimalMonth = pattern.bestMonth === currentMonth
    const isWorstMonth = pattern.worstMonth === currentMonth

    return {
      cheeseId: cheese.id,
      cheeseName: cheese.name,
      currentMonth,
      isOptimalMonth,
      isWorstMonth,
      bestMonth: pattern.bestMonth,
      worstMonth: pattern.worstMonth,
      predictedLiters: prediction?.predicted || 0,
      confidence: prediction?.confidence || 'low',
      trend: prediction?.trend || 'stable',
      suggestion: isOptimalMonth 
        ? 'Questo è il mese migliore per la produzione'
        : isWorstMonth
        ? 'Attenzione: questo è un mese tipicamente meno produttivo'
        : 'Produzione nella media stagionale'
    }
  })

  return suggestions.sort((a, b) => {
    // Prioritize optimal months
    if (a.isOptimalMonth && !b.isOptimalMonth) return -1
    if (!a.isOptimalMonth && b.isOptimalMonth) return 1
    return b.predictedLiters - a.predictedLiters
  })
}
