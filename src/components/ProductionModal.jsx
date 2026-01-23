import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { DeleteIcon } from './Icons'
import AlertDialog from './AlertDialog'
import './Icons.css'
import './Modal.css'

function ProductionModal({ cheeses, production, productions = [], onSave, onClose }) {
  const [productionDate, setProductionDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [productionNumber, setProductionNumber] = useState('')
  const [totalLiters, setTotalLiters] = useState('')
  const [selectedCheeses, setSelectedCheeses] = useState([])
  const [notes, setNotes] = useState('')
  const [alert, setAlert] = useState(null)

  // If editing, populate fields with existing production data
  useEffect(() => {
    if (production) {
      setProductionDate(production.productionDate || format(new Date(), 'yyyy-MM-dd'))
      setProductionNumber(production.productionNumber || '')
      setSelectedCheeses(production.cheeses || [])
      setNotes(production.notes || '')
      
      // Calcola la somma dei litri dai formaggi esistenti
      const calculatedTotal = (production.cheeses || []).reduce((total, cheese) => {
        return total + (parseInt(cheese.liters) || 0)
      }, 0)
      setTotalLiters(calculatedTotal > 0 ? calculatedTotal.toString() : '')
    } else {
      // Reset to defaults when creating new
      setProductionDate(format(new Date(), 'yyyy-MM-dd'))
      setProductionNumber('')
      setTotalLiters('')
      setSelectedCheeses([])
      setNotes('')
    }
  }, [production])

  const handleAddCheese = () => {
    setSelectedCheeses([...selectedCheeses, { cheeseId: '', liters: '' }])
  }


  const handleCheeseChange = (index, field, value) => {
    // Se si sta cambiando il formaggio, verifica che non sia già selezionato
    if (field === 'cheeseId' && value) {
      const isDuplicate = selectedCheeses.some((cheese, idx) => 
        idx !== index && cheese.cheeseId === value
      )
      
      if (isDuplicate) {
        setAlert({
          title: 'Validazione Formaggio',
          message: 'Questo formaggio è già stato selezionato. Scegli un formaggio diverso.',
          type: 'warning'
        })
        return // Non aggiornare se è un duplicato
      }
    }
    
    // Se si sta cambiando i litri, valida che sia un numero intero
    if (field === 'liters' && value !== '') {
      // Rimuovi eventuali virgole o punti decimali
      const cleanValue = value.replace(/[,.]/g, '')
      // Verifica che sia un numero intero valido
      if (!/^\d+$/.test(cleanValue)) {
        setAlert({
          title: 'Validazione Litri',
          message: 'I litri devono essere un numero intero (senza decimali).',
          type: 'warning'
        })
        return
      }
      value = cleanValue
    }
    
    const updated = [...selectedCheeses]
    updated[index][field] = field === 'liters' ? value : value
    setSelectedCheeses(updated)
    
    // Calcola automaticamente la somma dei litri quando cambiano i formaggi
    if (field === 'liters') {
      const sum = updated.reduce((total, cheese) => {
        const liters = parseInt(cheese.liters) || 0
        return total + liters
      }, 0)
      setTotalLiters(sum > 0 ? sum.toString() : '')
    }
  }
  
  // Calcola la somma quando vengono rimossi formaggi
  const handleRemoveCheese = (index) => {
    const updated = selectedCheeses.filter((_, i) => i !== index)
    setSelectedCheeses(updated)
    
    // Ricalcola la somma
    const sum = updated.reduce((total, cheese) => {
      const liters = parseInt(cheese.liters) || 0
      return total + liters
    }, 0)
    setTotalLiters(sum > 0 ? sum.toString() : '')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedCheeses.length === 0) {
      setAlert({
        title: 'Validazione Produzione',
        message: 'Aggiungi almeno un formaggio alla produzione',
        type: 'warning'
      })
      return
    }
    if (selectedCheeses.some(c => !c.cheeseId || !c.liters)) {
      setAlert({
        title: 'Validazione Produzione',
        message: 'Completa tutti i campi per i formaggi selezionati',
        type: 'warning'
      })
      return
    }
    
    // Verifica che il numero di produzione sia unico
    if (productionNumber.trim()) {
      const isDuplicate = productions.some(p => {
        // Se si sta modificando una produzione esistente, escludila dal controllo
        if (production && p.id === production.id) {
          return false
        }
        return p.productionNumber === productionNumber.trim()
      })
      
      if (isDuplicate) {
        setAlert({
          title: 'Validazione Produzione',
          message: `Il numero di produzione "${productionNumber}" è già utilizzato. Scegli un numero diverso.`,
          type: 'warning'
        })
        return
      }
    }
    
    // Ensure productionDate is saved as yyyy-MM-dd string (local date, no timezone conversion)
    const dateToSave = productionDate // Already in yyyy-MM-dd format from input type="date"
    
    // Calcola la somma esatta dei litri prima di salvare
    const calculatedTotal = selectedCheeses.reduce((total, cheese) => {
      const liters = parseInt(cheese.liters) || 0
      return total + liters
    }, 0)
    
    onSave({
      productionDate: dateToSave,
      productionNumber: productionNumber.trim(),
      totalLiters: Number(calculatedTotal), // Assicura che sia sempre un numero
      notes: notes.trim() || '',
      cheeses: selectedCheeses.map(c => ({
        cheeseId: c.cheeseId,
        liters: Number(parseInt(c.liters) || 0) // Assicura che sia sempre un numero
      }))
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{production ? 'Modifica Produzione' : 'Nuova Produzione'}</h2>
            {!production && (
              <p className="modal-subtitle">Registra una nuova produzione giornaliera.</p>
            )}
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Data</label>
            <div className="date-input-group">
              <input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                required
              />
              <span className="calendar-icon">📅</span>
            </div>
          </div>

          <div className="form-group">
            <label>N° Produzione</label>
            <input
              type="text"
              value={productionNumber}
              onChange={(e) => setProductionNumber(e.target.value)}
              placeholder="20260121001"
              required
            />
          </div>

          <div className="form-group">
            <div className="protocol-header">
              <label>Formaggi Prodotti</label>
              <button type="button" className="add-step-button" onClick={handleAddCheese}>
                + Aggiungi
              </button>
            </div>
            {selectedCheeses.length === 0 ? (
              <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Nessun formaggio aggiunto ancora. Clicca "+ Aggiungi" per iniziare.
              </p>
            ) : (
              <div className="protocol-steps">
                {selectedCheeses.map((cheeseProd, index) => (
                  <div key={index} className="protocol-step">
                    <select
                      className="activity-input"
                      value={cheeseProd.cheeseId}
                      onChange={(e) => handleCheeseChange(index, 'cheeseId', e.target.value)}
                      required
                    >
                      <option value="">Seleziona formaggio</option>
                      {cheeses.map(cheese => {
                        // Disabilita l'opzione se il formaggio è già selezionato in un'altra riga
                        const isSelected = selectedCheeses.some((c, idx) => 
                          idx !== index && c.cheeseId === cheese.id
                        )
                        return (
                          <option 
                            key={cheese.id} 
                            value={cheese.id}
                            disabled={isSelected}
                          >
                            {cheese.name}{isSelected ? ' (già selezionato)' : ''}
                          </option>
                        )
                      })}
                    </select>
                    <input
                      type="number"
                      className="day-input"
                      placeholder="Litri"
                      value={cheeseProd.liters}
                      onChange={(e) => handleCheeseChange(index, 'liters', e.target.value)}
                      min="0"
                      step="1"
                      required
                    />
                    <span className="liters-label">L</span>
                    <button
                      type="button"
                      className="icon-button delete"
                      onClick={() => handleRemoveCheese(index)}
                      title="Rimuovi formaggio"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Totale Litri</label>
            <input
              type="text"
              value={totalLiters ? `${totalLiters} L` : ''}
              readOnly
              placeholder="Calcolato automaticamente"
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label>Note (opzionale)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eventuali note sulla produzione..."
              rows="4"
              className="notes-textarea"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="save-button">
              {production ? 'Salva Modifiche' : 'Registra Produzione'}
            </button>
          </div>
        </form>
      </div>

      {alert && (
        <AlertDialog
          isOpen={true}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  )
}

export default ProductionModal
