import { useState, useMemo } from 'react'
import { format, parse, isWithinInterval, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns'
import { formatDateCapitalized } from '../utils/dateFormat'
import { EditIcon, DeleteIcon, NoteIcon, CalendarIcon, CheeseIcon } from './Icons'
import NotesModal from './NotesModal'
import ProductionModal from './ProductionModal'
import ConfirmDialog from './ConfirmDialog'
import './Icons.css'
import './ProductionsList.css'

function ProductionsManagement({ productions, cheeses, onSaveProduction, onDeleteProduction }) {
  const [notesModalProduction, setNotesModalProduction] = useState(null)
  const [editingProduction, setEditingProduction] = useState(null)
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [filterType, setFilterType] = useState('all') // 'all', 'date-range', 'year', 'specific-day'
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterSpecificDate, setFilterSpecificDate] = useState('')
  const [filterCheese, setFilterCheese] = useState('')

  const getCheeseName = (cheeseId) => {
    const cheese = cheeses.find(c => c.id === cheeseId)
    return cheese ? cheese.name : 'Formaggio sconosciuto'
  }

  const formatProductionDate = (dateStr) => {
    if (!dateStr) return 'Data non disponibile'
    try {
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return formatDateCapitalized(date, "EEEE d MMMM yyyy")
    } catch {
      return dateStr
    }
  }

  const filteredProductions = useMemo(() => {
    let filtered = productions

    // Apply date filters
    if (filterType !== 'all') {
      filtered = filtered.filter(production => {
        if (!production.productionDate) return false

        try {
          const [year, month, day] = production.productionDate.split('-').map(Number)
          const prodDate = new Date(year, month - 1, day)

          if (filterType === 'date-range') {
            if (!filterStartDate || !filterEndDate) return true
            const start = parse(filterStartDate, 'yyyy-MM-dd', new Date())
            const end = parse(filterEndDate, 'yyyy-MM-dd', new Date())
            return isWithinInterval(prodDate, { start, end })
          }

          if (filterType === 'year') {
            if (!filterYear) return true
            const yearNum = parseInt(filterYear)
            const yearStart = startOfYear(new Date(yearNum, 0, 1))
            const yearEnd = endOfYear(new Date(yearNum, 0, 1))
            return isWithinInterval(prodDate, { start: yearStart, end: yearEnd })
          }

          if (filterType === 'specific-day') {
            if (!filterSpecificDate) return true
            const specific = parse(filterSpecificDate, 'yyyy-MM-dd', new Date())
            const dayStart = startOfDay(specific)
            const dayEnd = endOfDay(specific)
            return isWithinInterval(prodDate, { start: dayStart, end: dayEnd })
          }

          return true
        } catch {
          return false
        }
      })
    }

    // Apply cheese filter
    if (filterCheese) {
      filtered = filtered.filter(production => {
        if (!production.cheeses || !Array.isArray(production.cheeses)) return false
        return production.cheeses.some(cheeseProd => cheeseProd.cheeseId === filterCheese)
      })
    }

    return filtered
  }, [productions, filterType, filterStartDate, filterEndDate, filterYear, filterSpecificDate, filterCheese])

  const clearFilters = () => {
    setFilterType('all')
    setFilterStartDate('')
    setFilterEndDate('')
    setFilterYear('')
    setFilterSpecificDate('')
    setFilterCheese('')
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  return (
    <div className="productions-list">
      <div className="productions-header">
        <div>
          <h2 className="section-title">Produzioni</h2>
          <p className="section-subtitle">Monitora tutte le tue produzioni</p>
        </div>
        <div className="productions-filters">
          <div className="filter-select-wrapper">
            <CalendarIcon className="filter-calendar-icon" />
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                // Reset all filters when changing type
                setFilterStartDate('')
                setFilterEndDate('')
                setFilterYear('')
                setFilterSpecificDate('')
              }}
            >
              <option value="all">Tutte le produzioni</option>
              <option value="date-range">Da data a data</option>
              <option value="year">Per anno</option>
              <option value="specific-day">Giorno specifico</option>
            </select>
          </div>

          {filterType === 'date-range' && (
            <div className="filter-inputs">
              <input
                type="date"
                className="filter-date-input"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                placeholder="Da data"
              />
              <span className="filter-separator">a</span>
              <input
                type="date"
                className="filter-date-input"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                placeholder="A data"
              />
            </div>
          )}

          {filterType === 'year' && (
            <select
              className="filter-select"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">Seleziona anno</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}

          {filterType === 'specific-day' && (
            <input
              type="date"
              className="filter-date-input"
              value={filterSpecificDate}
              onChange={(e) => setFilterSpecificDate(e.target.value)}
            />
          )}

          <div className="filter-select-wrapper">
            <CheeseIcon className="filter-cheese-icon" />
            <select
              className="filter-select"
              value={filterCheese}
              onChange={(e) => setFilterCheese(e.target.value)}
            >
              <option value="">Tutti i formaggi</option>
              {cheeses.map(cheese => (
                <option key={cheese.id} value={cheese.id}>{cheese.name}</option>
              ))}
            </select>
          </div>

          {(filterType !== 'all' || filterCheese) && (
            <button
              className="filter-clear-button"
              onClick={clearFilters}
              title="Rimuovi filtri"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {productions.length === 0 ? (
        <div className="empty-state">
          <p>Nessuna produzione programmata.</p>
        </div>
      ) : filteredProductions.length === 0 ? (
        <div className="empty-state">
          <p>Nessuna produzione trovata con i filtri selezionati.</p>
        </div>
      ) : (
        <div className="productions-grid">
          {filteredProductions.map(production => (
            <div key={production.id} className="production-card">
              <div className="production-card-header">
                <div>
                  <h4>Produzione #{production.productionNumber}</h4>
                  <p className="production-date">
                    {formatProductionDate(production.productionDate)}
                  </p>
                </div>
                <div className="production-actions">
                  <button
                    className="icon-button note"
                    onClick={() => setNotesModalProduction(production)}
                    title="Note"
                  >
                    <NoteIcon />
                  </button>
                  <button
                    className="icon-button edit"
                    onClick={() => {
                      setEditingProduction(production)
                      setIsProductionModalOpen(true)
                    }}
                    title="Modifica"
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={() => {
                      setConfirmDialog({
                        title: 'Elimina Produzione',
                        message: 'Sei sicuro di voler eliminare questa produzione? Tutte le attività associate verranno rimosse.',
                        onConfirm: async () => {
                          try {
                            await onDeleteProduction(production.id)
                            setConfirmDialog(null)
                          } catch (error) {
                            console.error('Error deleting production:', error)
                            setConfirmDialog(null)
                          }
                        },
                        onCancel: () => setConfirmDialog(null)
                      })
                    }}
                    title="Elimina"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
              
              {production.totalLiters && (
                <p className="production-meta">
                  <strong>Litri Totali:</strong> {production.totalLiters}L
                </p>
              )}
              
              <div className="production-cheeses">
                <strong>Formaggi:</strong>
                <ul>
                  {production.cheeses && production.cheeses.map((cheeseProd, idx) => (
                    <li key={idx}>
                      {getCheeseName(cheeseProd.cheeseId)} - {cheeseProd.liters}L
                    </li>
                  ))}
                </ul>
              </div>

              {production.notes && production.notes.trim() && (
                <div className="production-notes">
                  <strong>Note:</strong> {production.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {notesModalProduction && (
        <NotesModal
          production={notesModalProduction}
          onSave={async (notes) => {
            try {
              const updatedProduction = {
                ...notesModalProduction,
                notes: notes.trim() || ''
              }
              await onSaveProduction(updatedProduction)
              setNotesModalProduction(null)
            } catch (error) {
              console.error('Error saving notes:', error)
            }
          }}
          onClose={() => setNotesModalProduction(null)}
        />
      )}

      {isProductionModalOpen && (
        <ProductionModal
          cheeses={cheeses}
          production={editingProduction}
          productions={productions}
          onSave={async (productionData) => {
            try {
              const productionToSave = editingProduction
                ? { ...productionData, id: editingProduction.id }
                : { ...productionData, id: `temp-${Date.now()}` }
              
              await onSaveProduction(productionToSave)
              setIsProductionModalOpen(false)
              setEditingProduction(null)
            } catch (error) {
              console.error('Error saving production:', error)
            }
          }}
          onClose={() => {
            setIsProductionModalOpen(false)
            setEditingProduction(null)
          }}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText || 'Elimina'}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
          type="danger"
        />
      )}
    </div>
  )
}

export default ProductionsManagement
