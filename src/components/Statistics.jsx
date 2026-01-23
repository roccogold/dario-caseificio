import { useState, useMemo, useEffect } from 'react'
import { format, parse, startOfYear, endOfYear, startOfMonth, endOfMonth, eachMonthOfInterval, getYear } from 'date-fns'
import it from 'date-fns/locale/it'
import { CalendarIcon, CheeseIcon } from './Icons'
import { getSeasonalPattern, calculateCheesePerformance, predictNextMonth } from '../utils/predictions'
import './Icons.css'
import './Statistics.css'

function Statistics({ productions, cheeses }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [viewType, setViewType] = useState('yearly') // 'yearly' or 'monthly'
  const [selectedCheese, setSelectedCheese] = useState(null) // Filtro per formaggio
  const [hoveredBar, setHoveredBar] = useState(null) // Per tooltip migliorato
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 }) // Posizione tooltip
  
  // Animated values for count-up effect
  const [animatedTotalLiters, setAnimatedTotalLiters] = useState(0)
  const [animatedProductions, setAnimatedProductions] = useState(0)
  const [animatedMonthlyAvg, setAnimatedMonthlyAvg] = useState(0)

  // Get all available years from productions
  const availableYears = useMemo(() => {
    const years = new Set()
    productions.forEach(prod => {
      if (prod.productionDate) {
        const [year] = prod.productionDate.split('-').map(Number)
        years.add(year)
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [productions])

  // Get cheese name helper
  const getCheeseName = (cheeseId) => {
    const cheese = cheeses.find(c => c.id === cheeseId)
    return cheese ? cheese.name : 'Formaggio sconosciuto'
  }

  // Calculate yearly statistics
  const yearlyStats = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1))
    const yearEnd = endOfYear(new Date(selectedYear, 11, 31))
    
    let yearProductions = productions.filter(prod => {
      if (!prod.productionDate) return false
      const [year, month, day] = prod.productionDate.split('-').map(Number)
      const prodDate = new Date(year, month - 1, day)
      return prodDate >= yearStart && prodDate <= yearEnd
    })

    // Filtra per formaggio se selezionato
    if (selectedCheese) {
      yearProductions = yearProductions.filter(prod => {
        if (!prod.cheeses || !Array.isArray(prod.cheeses)) return false
        return prod.cheeses.some(c => c.cheeseId === selectedCheese)
      })
    }

    // Total liters - se un formaggio è selezionato, calcola solo i litri di quel formaggio
    const totalLiters = selectedCheese 
      ? yearProductions.reduce((sum, prod) => {
          if (!prod.cheeses || !Array.isArray(prod.cheeses)) return sum
          const cheeseProd = prod.cheeses.find(c => c.cheeseId === selectedCheese)
          if (!cheeseProd) return sum
          const liters = typeof cheeseProd.liters === 'number' 
            ? cheeseProd.liters 
            : (parseFloat(cheeseProd.liters) || 0)
          return sum + liters
        }, 0)
      : yearProductions.reduce((sum, prod) => {
          let liters = 0
          if (prod.totalLiters !== null && prod.totalLiters !== undefined) {
            if (typeof prod.totalLiters === 'number') {
              liters = prod.totalLiters
            } else if (typeof prod.totalLiters === 'string') {
              liters = parseFloat(prod.totalLiters) || 0
            }
          }
          return sum + liters
        }, 0)

    // Cheese production count
    const cheeseCounts = {}
    yearProductions.forEach(prod => {
      if (prod.cheeses && Array.isArray(prod.cheeses)) {
        prod.cheeses.forEach(cheeseProd => {
          // Se un formaggio è selezionato, mostra solo quello
          if (selectedCheese && cheeseProd.cheeseId !== selectedCheese) return
          
          const cheeseName = getCheeseName(cheeseProd.cheeseId)
          if (!cheeseCounts[cheeseName]) {
            cheeseCounts[cheeseName] = {
              count: 0,
              liters: 0
            }
          }
          cheeseCounts[cheeseName].count += 1
          const liters = typeof cheeseProd.liters === 'number' ? cheeseProd.liters : parseFloat(cheeseProd.liters) || 0
          cheeseCounts[cheeseName].liters += liters
        })
      }
    })

    // Sort cheeses by production count
    const sortedCheeses = Object.entries(cheeseCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)

    // Se un formaggio è selezionato, conta solo le produzioni che contengono quel formaggio
    const totalProductions = selectedCheese
      ? yearProductions.filter(prod => {
          if (!prod.cheeses || !Array.isArray(prod.cheeses)) return false
          return prod.cheeses.some(c => c.cheeseId === selectedCheese)
        }).length
      : yearProductions.length

    return {
      totalLiters,
      totalProductions,
      cheeseStats: sortedCheeses
    }
  }, [productions, selectedYear, cheeses, selectedCheese])

  // Calculate monthly statistics with cheese filter
  const monthlyStats = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1))
    const yearEnd = endOfYear(new Date(selectedYear, 11, 31))
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

    return months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      let monthProductions = productions.filter(prod => {
        if (!prod.productionDate) return false
        const [year, prodMonth, day] = prod.productionDate.split('-').map(Number)
        const prodDate = new Date(year, prodMonth - 1, day)
        return prodDate >= monthStart && prodDate <= monthEnd
      })

      // Filtra per formaggio se selezionato
      if (selectedCheese) {
        monthProductions = monthProductions.filter(prod => {
          if (!prod.cheeses || !Array.isArray(prod.cheeses)) return false
          return prod.cheeses.some(c => c.cheeseId === selectedCheese)
        })
      }

      // Calcola totalLiters: se un formaggio è selezionato, somma solo i litri di quel formaggio
      const totalLiters = monthProductions.reduce((sum, prod) => {
        if (selectedCheese) {
          // Se un formaggio è selezionato, somma solo i litri di quel formaggio
          if (prod.cheeses && Array.isArray(prod.cheeses)) {
            const selectedCheeseProd = prod.cheeses.find(c => c.cheeseId === selectedCheese)
            if (selectedCheeseProd) {
              const liters = typeof selectedCheeseProd.liters === 'number' 
                ? selectedCheeseProd.liters 
                : (parseFloat(selectedCheeseProd.liters) || 0)
              return sum + liters
            }
          }
          return sum
        } else {
          // Se nessun formaggio è selezionato, usa il totale della produzione
          let liters = 0
          if (prod.totalLiters !== null && prod.totalLiters !== undefined) {
            if (typeof prod.totalLiters === 'number') {
              liters = prod.totalLiters
            } else if (typeof prod.totalLiters === 'string') {
              liters = parseFloat(prod.totalLiters) || 0
            }
          }
          return sum + liters
        }
      }, 0)

      const cheeseCounts = {}
      const cheeseLiters = {}
      monthProductions.forEach(prod => {
        if (prod.cheeses && Array.isArray(prod.cheeses)) {
          prod.cheeses.forEach(cheeseProd => {
            // Se un formaggio è selezionato, mostra solo quel formaggio
            if (selectedCheese && cheeseProd.cheeseId !== selectedCheese) {
              return
            }
            const cheeseName = getCheeseName(cheeseProd.cheeseId)
            if (!cheeseCounts[cheeseName]) {
              cheeseCounts[cheeseName] = 0
              cheeseLiters[cheeseName] = 0
            }
            cheeseCounts[cheeseName] += 1
            const liters = typeof cheeseProd.liters === 'number' 
              ? cheeseProd.liters 
              : (parseFloat(cheeseProd.liters) || 0)
            cheeseLiters[cheeseName] += liters
          })
        }
      })

      return {
        month,
        monthName: format(month, 'MMMM', { locale: it }),
        monthNameShort: format(month, 'MMM', { locale: it }),
        totalLiters,
        totalProductions: monthProductions.length,
        cheeseCounts,
        cheeseLiters
      }
    })
  }, [productions, selectedYear, cheeses, selectedCheese])

  // Calculate seasonal pattern for selected cheese
  const seasonalPattern = useMemo(() => {
    if (!selectedCheese) return null
    return getSeasonalPattern(productions, selectedCheese)
  }, [productions, selectedCheese])

  // Calculate performance for selected cheese
  const cheesePerformance = useMemo(() => {
    if (!selectedCheese) return null
    return calculateCheesePerformance(productions, selectedCheese, 'year')
  }, [productions, selectedCheese])

  // Get prediction for selected cheese
  const cheesePrediction = useMemo(() => {
    if (!selectedCheese) return null
    return predictNextMonth(productions, selectedCheese)
  }, [productions, selectedCheese])

  // Get max liters for bar chart scaling
  const maxMonthlyLiters = useMemo(() => {
    return Math.max(...monthlyStats.map(m => m.totalLiters), 1)
  }, [monthlyStats])

  // Extract primitive values to avoid unnecessary re-renders
  const totalLitersValue = yearlyStats.totalLiters
  const totalProductionsValue = yearlyStats.totalProductions
  // Media mensile = litri totali diviso 12 mesi (non per produzione)
  const monthlyAvgValue = totalLitersValue / 12

  // Reset animated values when data changes
  useEffect(() => {
    setAnimatedTotalLiters(0)
    setAnimatedProductions(0)
    setAnimatedMonthlyAvg(0)
  }, [selectedYear, viewType, totalLitersValue, totalProductionsValue, selectedCheese])

  // Count-up animation effect
  useEffect(() => {
    if (viewType === 'yearly') {
      const duration = 1500 // 1.5 seconds
      const steps = 60
      const stepDuration = duration / steps
      
      // Animate total liters
      const totalLitersTarget = totalLitersValue
      const litersStep = totalLitersTarget / steps
      let litersCurrent = 0
      
      // Animate productions
      const productionsTarget = totalProductionsValue
      const productionsStep = productionsTarget / steps
      let productionsCurrent = 0
      
      // Animate monthly average
      const monthlyAvgTarget = monthlyAvgValue
      const monthlyAvgStep = monthlyAvgTarget / steps
      let monthlyAvgCurrent = 0
      
      let step = 0
      const interval = setInterval(() => {
        step++
        
        if (step <= steps) {
          litersCurrent = Math.min(litersCurrent + litersStep, totalLitersTarget)
          productionsCurrent = Math.min(productionsCurrent + productionsStep, productionsTarget)
          monthlyAvgCurrent = Math.min(monthlyAvgCurrent + monthlyAvgStep, monthlyAvgTarget)
          
          setAnimatedTotalLiters(Math.floor(litersCurrent))
          setAnimatedProductions(Math.floor(productionsCurrent))
          setAnimatedMonthlyAvg(monthlyAvgCurrent)
        } else {
          // Ensure final values are exact
          setAnimatedTotalLiters(totalLitersTarget)
          setAnimatedProductions(productionsTarget)
          setAnimatedMonthlyAvg(monthlyAvgTarget)
          clearInterval(interval)
        }
      }, stepDuration)
      
      return () => clearInterval(interval)
    } else {
      // In monthly view, set values directly without animation
      setAnimatedTotalLiters(totalLitersValue)
      setAnimatedProductions(totalProductionsValue)
      setAnimatedMonthlyAvg(monthlyAvgValue)
    }
  }, [viewType, totalLitersValue, totalProductionsValue, monthlyAvgValue, selectedCheese])

  return (
    <div className="statistics">
      <div className="statistics-header">
        <div>
          <h2 className="section-title">Statistiche</h2>
          <p className="section-subtitle">Monitora le performance della tua produzione</p>
        </div>
        <div className="statistics-filters">
          <div className="filter-select-wrapper">
            <CalendarIcon className="filter-calendar-icon" />
            <select
              className="filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {availableYears.length > 0 ? (
                availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))
              ) : (
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              )}
            </select>
          </div>
          <div className="filter-select-wrapper">
            <CheeseIcon className="filter-cheese-icon" />
            <select
              className="filter-select"
              value={selectedCheese || ''}
              onChange={(e) => setSelectedCheese(e.target.value || null)}
            >
              <option value="">Tutti i formaggi</option>
              {cheeses.map(cheese => (
                <option key={cheese.id} value={cheese.id}>{cheese.name}</option>
              ))}
            </select>
          </div>
          <div className="view-toggle">
            <button
              className={`toggle-button ${viewType === 'yearly' ? 'active' : ''}`}
              onClick={() => setViewType('yearly')}
            >
              Annuale
            </button>
            <button
              className={`toggle-button ${viewType === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewType('monthly')}
            >
              Mensile
            </button>
          </div>
        </div>
      </div>

      <div className="statistics-content">
        {viewType === 'yearly' ? (
          <div className="yearly-view">
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-card-content">
                  <h3>Litri Totali</h3>
                  <p className="stat-value">{String(animatedTotalLiters).replace(/^0+/, '') || '0'}L</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-content">
                  <h3>Produzioni</h3>
                  <p className="stat-value">{animatedProductions}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-content">
                  <h3>Media Mensile</h3>
                  <p className="stat-value">
                    {animatedMonthlyAvg > 0 
                      ? animatedMonthlyAvg.toFixed(1)
                      : 0}L
                  </p>
                </div>
              </div>
            </div>

            {/* Mostra "Formaggi Più Prodotti" solo se non c'è un filtro per formaggio specifico */}
            {!selectedCheese && (
              <div className="cheese-ranking">
                <h3 className="ranking-title">Formaggi Più Prodotti</h3>
                {yearlyStats.cheeseStats.length > 0 ? (
                  <div className="ranking-list">
                    {yearlyStats.cheeseStats.map((cheese, index) => {
                      const cheeseData = cheeses.find(c => c.name === cheese.name)
                      return (
                        <div key={cheese.name} className="ranking-item">
                          <div className="ranking-position">#{index + 1}</div>
                          <div 
                            className="ranking-color-indicator"
                            style={{ backgroundColor: cheeseData?.color || '#FFD700' }}
                          ></div>
                          <div className="ranking-info">
                            <div className="ranking-name">{cheese.name}</div>
                            <div className="ranking-details">
                              {cheese.count} produzione{cheese.count !== 1 ? 'i' : ''} • {cheese.liters.toLocaleString('it-IT')}L
                              {cheeseData?.yieldLitersPerKg && (
                                <span className="ranking-meta"> • Resa: {cheeseData.yieldLitersPerKg}L/kg</span>
                              )}
                              {cheeseData?.pricePerKg && (
                                <span className="ranking-meta"> • Prezzo: €{cheeseData.pricePerKg.toFixed(2)}/kg</span>
                              )}
                            </div>
                          </div>
                          <div className="ranking-bar">
                            <div 
                              className="ranking-bar-fill"
                              style={{ 
                                width: `${(cheese.count / yearlyStats.cheeseStats[0].count) * 100}%`,
                                backgroundColor: cheeseData?.color || '#FFD700'
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Nessuna produzione registrata per questo anno.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="monthly-view">
            <div className="monthly-chart">
              <h3 className="chart-title">
                Produzione Mensile ({selectedYear})
                {selectedCheese && ` - ${cheeses.find(c => c.id === selectedCheese)?.name || ''}`}
              </h3>
              <div className="chart-container">
                {monthlyStats.map((month, index) => {
                  const cheeseEntries = Object.entries(month.cheeseLiters || {})
                    .map(([name, liters]) => {
                      const cheeseData = cheeses.find(c => c.name === name)
                      return {
                        name,
                        liters: typeof liters === 'number' ? liters : (parseFloat(liters) || 0),
                        color: cheeseData?.color || '#FFD700'
                      }
                    })
                    .filter(cheese => cheese.liters > 0)
                    .sort((a, b) => b.liters - a.liters)
                  
                  return (
                    <div key={index} className="chart-bar-wrapper">
                      <div className="chart-bar-container">
                        {cheeseEntries.length > 0 ? (
                          <div className="chart-bar-stacked">
                            {cheeseEntries.map((cheese, cheeseIndex) => {
                              const heightPercent = (cheese.liters / maxMonthlyLiters) * 100
                              const bottomPercent = cheeseEntries.slice(cheeseIndex + 1).reduce((sum, c) => sum + (c.liters / maxMonthlyLiters) * 100, 0)
                              return (
                                <div
                                  key={cheese.name}
                                  className="chart-bar-segment"
                                  style={{
                                    height: `${heightPercent}%`,
                                    bottom: `${bottomPercent}%`,
                                    backgroundColor: cheese.color,
                                    minHeight: cheese.liters > 0 ? '4px' : '0'
                                  }}
                                  onMouseEnter={(e) => {
                                    setHoveredBar({ month: month.monthName, cheese: cheese.name, liters: cheese.liters })
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 })
                                  }}
                                  onMouseLeave={() => setHoveredBar(null)}
                                  onMouseMove={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 })
                                  }}
                                >
                                  {cheeseIndex === 0 && month.totalLiters > 0 && (
                                    <span className="chart-bar-value">
                                      {String(month.totalLiters).replace(/^0+/, '') || '0'}L
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div 
                            className="chart-bar"
                            style={{ 
                              height: `${(month.totalLiters / maxMonthlyLiters) * 100}%`,
                              minHeight: month.totalLiters > 0 ? '4px' : '0'
                            }}
                            onMouseEnter={(e) => {
                              setHoveredBar({ month: month.monthName, liters: month.totalLiters })
                              const rect = e.currentTarget.getBoundingClientRect()
                              setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 })
                            }}
                            onMouseLeave={() => setHoveredBar(null)}
                            onMouseMove={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 })
                            }}
                          >
                            <span className="chart-bar-value">
                              {month.totalLiters > 0 ? `${String(month.totalLiters).replace(/^0+/, '') || '0'}L` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="chart-label">
                        {format(month.month, 'MMM', { locale: it })}
                      </div>
                    </div>
                  )
                })}
              </div>
              {hoveredBar && (
                <div 
                  className="chart-tooltip"
                  style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div className="tooltip-content">
                    {hoveredBar.cheese ? (
                      <>
                        <span className="tooltip-cheese">{hoveredBar.cheese}</span>
                        <span className="tooltip-month"><strong>{hoveredBar.month}</strong>: {String(hoveredBar.liters).replace(/^0+/, '') || '0'}L</span>
                      </>
                    ) : (
                      <span className="tooltip-month"><strong>{hoveredBar.month}</strong>: {String(hoveredBar.liters).replace(/^0+/, '') || '0'}L</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="monthly-details">
              <h3 className="details-title">Dettaglio Mensile</h3>
              <div className="monthly-table">
                {monthlyStats.map((month, index) => (
                  <div key={index} className="monthly-row">
                    <div className="monthly-row-header">
                      <span className="month-name">{format(month.month, 'MMMM yyyy', { locale: it })}</span>
                      <span className="month-stats">
                        {month.totalProductions} {month.totalProductions === 1 ? 'produzione' : 'produzioni'} • {String(month.totalLiters).replace(/^0+/, '') || '0'}L
                      </span>
                    </div>
                    {Object.keys(month.cheeseCounts).length > 0 && (
                      <div className="monthly-cheeses">
                        {Object.entries(month.cheeseCounts).map(([name, count]) => {
                          const cheeseData = cheeses.find(c => c.name === name)
                          return (
                            <span key={name} className="cheese-badge">
                              <span 
                                className="cheese-badge-color"
                                style={{ backgroundColor: cheeseData?.color || '#FFD700' }}
                              ></span>
                              {name} ({count})
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analisi dettagliata formaggio selezionato - visibile in entrambe le viste */}
        {selectedCheese && seasonalPattern && (() => {
          const selectedCheeseData = cheeses.find(c => c.id === selectedCheese)
          return (
          <div className="cheese-analysis">
            <h3 className="analysis-title">Analisi Dettagliata: {selectedCheeseData?.name}</h3>
            
            <div className="analysis-grid">
              {cheesePerformance && (
                <div className="analysis-card">
                  <h4>Performance Anno {selectedYear}</h4>
                  <div className="analysis-metrics">
                    <div className="metric-item">
                      <span className="metric-label" data-tooltip="Somma totale di tutti i litri prodotti per questo formaggio nell'anno selezionato">Litri Totali</span>
                      <span className="metric-value" data-tooltip="Somma totale di tutti i litri prodotti per questo formaggio nell'anno selezionato">{String(cheesePerformance.totalLiters).replace(/^0+/, '') || '0'}L</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label" data-tooltip="Numero totale di produzioni effettuate per questo formaggio nell'anno selezionato">Produzioni</span>
                      <span className="metric-value" data-tooltip="Numero totale di produzioni effettuate per questo formaggio nell'anno selezionato">{cheesePerformance.productionCount}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label" data-tooltip="Media dei litri prodotti per ogni singola produzione (Litri Totali ÷ Produzioni)">Media per Produzione</span>
                      <span className="metric-value" data-tooltip="Media dei litri prodotti per ogni singola produzione (Litri Totali ÷ Produzioni)">{Math.round(cheesePerformance.avgPerProduction)}L</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label" data-tooltip="Variazione percentuale tra la prima metà e la seconda metà dell'anno. Positivo = crescita, Negativo = calo">Tasso di Crescita</span>
                      <span className={`metric-value ${cheesePerformance.growthRate >= 0 ? 'positive' : 'negative'}`} data-tooltip="Variazione percentuale tra la prima metà e la seconda metà dell'anno. Positivo = crescita, Negativo = calo">
                        {cheesePerformance.growthRate >= 0 ? '+' : ''}{cheesePerformance.growthRate}%
                      </span>
                    </div>
                    {selectedCheeseData?.yieldLitersPerKg && (
                      <div className="metric-item">
                        <span className="metric-label" data-tooltip="Resa in litri di latte necessari per produrre 1 kg di formaggio">Resa (L/kg)</span>
                        <span className="metric-value" data-tooltip="Resa in litri di latte necessari per produrre 1 kg di formaggio">{selectedCheeseData.yieldLitersPerKg}</span>
                      </div>
                    )}
                    {selectedCheeseData?.pricePerKg && (
                      <div className="metric-item">
                        <span className="metric-label" data-tooltip="Prezzo di vendita per chilogrammo di formaggio">Prezzo (€/kg)</span>
                        <span className="metric-value" data-tooltip="Prezzo di vendita per chilogrammo di formaggio">€{selectedCheeseData.pricePerKg.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {cheesePrediction && (
                <div className="analysis-card">
                  <h4 data-tooltip="La previsione analizza gli ultimi 6 mesi di produzione per stimare i litri previsti per il prossimo mese. La confidenza dipende dalla quantità di dati storici disponibili.">Previsione Prossimo Mese</h4>
                  <div className="prediction-content">
                    <p className="prediction-value" data-tooltip="Litri previsti per il prossimo mese basati sull'analisi degli ultimi 6 mesi">{cheesePrediction.predicted}L</p>
                    <div className="prediction-details">
                      <span className={`trend ${cheesePrediction.trend}`} data-tooltip={cheesePrediction.trend === 'increasing' ? 'La produzione è in aumento rispetto ai mesi precedenti' : cheesePrediction.trend === 'decreasing' ? 'La produzione è in calo rispetto ai mesi precedenti' : 'La produzione è stabile rispetto ai mesi precedenti'}>
                        {cheesePrediction.trend === 'increasing' ? '↑ In crescita' : 
                         cheesePrediction.trend === 'decreasing' ? '↓ In calo' : 
                         '→ Stabile'}
                      </span>
                      <span className={`confidence ${cheesePrediction.confidence}`} data-tooltip={cheesePrediction.confidence === 'high' ? 'Alta confidenza: previsione basata su almeno 3 mesi di dati' : cheesePrediction.confidence === 'medium' ? 'Media confidenza: previsione basata su 2 mesi di dati' : 'Bassa confidenza: previsione basata su meno di 2 mesi di dati'}>
                        {cheesePrediction.confidence === 'high' ? 'Alta confidenza' : 
                         cheesePrediction.confidence === 'medium' ? 'Media confidenza' : 
                         'Bassa confidenza'}
                      </span>
                    </div>
                    <p className="prediction-explanation">
                      Basata sull'analisi degli ultimi 6 mesi di produzione. La previsione considera la media mobile e il trend di crescita/calo.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pattern Stagionale */}
            <div className="seasonal-pattern-section">
              <h4>Pattern Stagionale</h4>
              <div className="pattern-info">
                {seasonalPattern.hasMultipleMonths ? (
                  <>
                    <p>
                      <strong>Mese migliore:</strong> {format(new Date(2024, seasonalPattern.bestMonth - 1, 1), 'MMMM', { locale: it })}
                    </p>
                    <p>
                      <strong>Mese peggiore:</strong> {format(new Date(2024, seasonalPattern.worstMonth - 1, 1), 'MMMM', { locale: it })}
                    </p>
                  </>
                ) : (
                  <p>
                    <strong>Dati disponibili:</strong> Solo {(() => {
                      const monthName = format(new Date(2024, seasonalPattern.bestMonth - 1, 1), 'MMMM', { locale: it })
                      return monthName.charAt(0).toUpperCase() + monthName.slice(1)
                    })()}, aggiungi produzioni in altri mesi per vedere il pattern stagionale completo.
                  </p>
                )}
              </div>
              <div className="seasonal-chart">
                {seasonalPattern.pattern.slice(0, 12).map((item, index) => {
                  const maxValue = Math.max(...seasonalPattern.pattern.map(p => p.average))
                  const height = maxValue > 0 ? (item.average / maxValue) * 100 : 0
                  const isBest = item.month === seasonalPattern.bestMonth
                  const isWorst = item.month === seasonalPattern.worstMonth
                  return (
                    <div key={index} className="seasonal-bar">
                      <div 
                        className={`seasonal-bar-fill ${isBest ? 'best' : isWorst ? 'worst' : ''}`}
                        style={{ height: `${height}%` }}
                        title={`${format(new Date(2024, item.month - 1, 1), 'MMMM', { locale: it })}: ${Math.round(item.average)}L`}
                      >
                        {height > 10 && (
                          <span className="seasonal-bar-value">{Math.round(item.average)}L</span>
                        )}
                      </div>
                      <span className="seasonal-bar-label">
                        {format(new Date(2024, item.month - 1, 1), 'MMM', { locale: it })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          )
        })()}
      </div>
    </div>
  )
}

export default Statistics
