import { useState, useEffect } from 'react'
import { DeleteIcon } from './Icons'
import { getAvailableColors, getDefaultColor, validateCheeseColor, CHEESE_COLORS } from '../utils/cheeseColors'
import AlertDialog from './AlertDialog'
import './Icons.css'
import './Modal.css'

function CheeseTypeModal({ cheese, cheeses, onSave, onClose }) {
  const [name, setName] = useState('')
  const [protocol, setProtocol] = useState([{ day: 0, activity: '' }])
  const [color, setColor] = useState('#FFD700')
  const [yieldLitersPerKg, setYieldLitersPerKg] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    if (cheese) {
      setName(cheese.name)
      setProtocol(cheese.protocol.length > 0 ? cheese.protocol : [{ day: 0, activity: '' }])
      setColor(cheese.color || getDefaultColor(cheese.name))
      setYieldLitersPerKg(cheese.yieldLitersPerKg || '')
      setPricePerKg(cheese.pricePerKg || '')
    } else {
      setName('')
      setProtocol([{ day: 0, activity: '' }])
      setColor('#FFD700')
      setYieldLitersPerKg('')
      setPricePerKg('')
    }
  }, [cheese])

  // Aggiorna il colore quando cambia il nome del formaggio
  useEffect(() => {
    if (name) {
      const defaultColor = getDefaultColor(name)
      // Se il colore attuale non è valido per il nuovo nome, usa il default
      if (!validateCheeseColor(name, color)) {
        setColor(defaultColor)
      }
    }
  }, [name])

  const handleAddStep = () => {
    const lastDay = protocol.length > 0 ? Math.max(...protocol.map(p => p.day)) : -1
    setProtocol([...protocol, { day: lastDay + 1, activity: '' }])
  }

  const handleRemoveStep = (index) => {
    setProtocol(protocol.filter((_, i) => i !== index))
  }

  const handleStepChange = (index, field, value) => {
    const updated = [...protocol]
    if (field === 'day') {
      updated[index].day = parseInt(value) || 0
    } else {
      updated[index].activity = value
    }
    setProtocol(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validProtocol = protocol.filter(p => p.activity.trim() !== '')
    if (validProtocol.length === 0) {
      setAlert({
        title: 'Validazione Protocollo',
        message: 'Aggiungi almeno un passaggio al protocollo',
        type: 'warning'
      })
      return
    }
    
    // Valida il nome duplicato
    const trimmedName = name.trim()
    const duplicateCheese = cheeses.find(c => 
      c.name.toLowerCase() === trimmedName.toLowerCase() && 
      (!cheese || c.id !== cheese.id)
    )
    
    if (duplicateCheese) {
      setAlert({
        title: 'Validazione Nome',
        message: `Un formaggio con il nome "${trimmedName}" esiste già. Scegli un nome diverso.`,
        type: 'warning'
      })
      return
    }
    
    // Valida il colore
    if (!validateCheeseColor(trimmedName, color)) {
      const colorName = getAvailableColors(trimmedName)[0]?.name || 'un colore valido'
      setAlert({
        title: 'Validazione Tag',
        message: `Il formaggio "${trimmedName}" non può usare questo tag. Seleziona ${colorName}.`,
        type: 'warning'
      })
      return
    }
    
    // Ordina il protocollo per giorno prima di salvare
    const sortedProtocol = [...validProtocol].sort((a, b) => a.day - b.day)
    
    onSave({ 
      name: trimmedName, 
      protocol: sortedProtocol, 
      color,
      yieldLitersPerKg: yieldLitersPerKg ? parseFloat(yieldLitersPerKg) : null,
      pricePerKg: pricePerKg ? parseFloat(pricePerKg) : null
    })
  }

  const availableColors = getAvailableColors(name)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{cheese ? 'Modifica Protocollo' : 'Crea Nuovo Tipo di Formaggio'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome Formaggio</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Inserisci il nome del formaggio"
              required
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Resa (Litri per kg)</label>
              <input
                type="number"
                step="0.01"
                value={yieldLitersPerKg}
                onChange={(e) => setYieldLitersPerKg(e.target.value)}
                placeholder="es. 0.80"
              />
            </div>
            <div className="form-group">
              <label>Prezzo (€ per kg)</label>
              <input
                type="number"
                step="0.01"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                placeholder="es. 12.50"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tag</label>
            <div className="color-picker">
              {availableColors.map((colorOption) => (
                <button
                  key={colorOption.hex}
                  type="button"
                  className={`color-option ${color === colorOption.hex ? 'selected' : ''}`}
                  style={{ backgroundColor: colorOption.hex }}
                  onClick={() => setColor(colorOption.hex)}
                  title={colorOption.name}
                >
                  {color === colorOption.hex && (
                    <span className="color-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="protocol-section">
            <div className="protocol-header">
              <p>Gestisci i passaggi del protocollo di produzione</p>
              <button type="button" className="add-step-button" onClick={handleAddStep}>
                Aggiungi Passaggio
              </button>
            </div>

            <div className="protocol-steps">
              {[...protocol].sort((a, b) => a.day - b.day).map((step, index) => {
                // Trova l'indice originale nel protocollo non ordinato
                const originalIndex = protocol.findIndex(p => p === step)
                return (
                  <div key={originalIndex} className="protocol-step-card">
                    <div className="protocol-step-content">
                      <div className="protocol-step-field">
                        <label>Giorno</label>
                        <input
                          type="number"
                          className="day-input"
                          value={step.day}
                          onChange={(e) => handleStepChange(originalIndex, 'day', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="protocol-step-field">
                        <label>Attività</label>
                        <input
                          type="text"
                          className="activity-input"
                          placeholder="Inserisci descrizione attività"
                          value={step.activity}
                          onChange={(e) => handleStepChange(originalIndex, 'activity', e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="icon-button delete"
                      onClick={() => handleRemoveStep(originalIndex)}
                      title="Rimuovi passaggio"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="save-button">
              Salva Protocollo
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

export default CheeseTypeModal
