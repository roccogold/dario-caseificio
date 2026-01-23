import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import './Modal.css'

function ActivityModal({ initialDate, activity, onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(format(initialDate || new Date(), 'yyyy-MM-dd'))
  const [description, setDescription] = useState('')
  const [recurrence, setRecurrence] = useState('none')

  // If editing, populate fields with existing activity data
  useEffect(() => {
    if (activity) {
      setTitle(activity.title || '')
      setDate(activity.date || format(initialDate || new Date(), 'yyyy-MM-dd'))
      setDescription(activity.description || '')
      setRecurrence(activity.recurrence || 'none')
    } else {
      // Reset to defaults when creating new
      setTitle('')
      setDate(format(initialDate || new Date(), 'yyyy-MM-dd'))
      setDescription('')
      setRecurrence('none')
    }
  }, [activity, initialDate])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      type: 'activity',
      title,
      date: format(new Date(date), 'yyyy-MM-dd'),
      description,
      recurrence,
      isCompleted: activity?.isCompleted || false // Mantieni lo stato di completamento se esiste
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{activity ? 'Modifica Attività' : 'Aggiungi Nuova Attività'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Titolo Attività</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Pulisci finestre"
              required
            />
          </div>

          <div className="form-group">
            <label>Data</label>
            <div className="date-input-group">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <span className="calendar-icon">📅</span>
            </div>
          </div>

          <div className="form-group">
            <label>Descrizione (opzionale)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dettagli aggiuntivi su questa attività..."
            />
          </div>

          <div className="form-group">
            <label>Ricorrenza</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="none">Nessuna ricorrenza</option>
              <option value="daily">Giornaliera</option>
              <option value="weekly">Settimanale</option>
              <option value="monthly">Mensile</option>
              <option value="quarterly">Trimestrale</option>
              <option value="semiannual">Semestrale</option>
              <option value="yearly">Annuale</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="save-button">
              {activity ? 'Salva Modifiche' : 'Aggiungi Attività'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ActivityModal
