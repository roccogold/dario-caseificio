import { useState, useEffect } from 'react'
import './Modal.css'

function NotesModal({ production, onSave, onClose }) {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (production) {
      setNotes(production.notes || '')
    } else {
      setNotes('')
    }
  }, [production])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(notes)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content notes-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Note - Produzione #{production?.productionNumber || ''}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Note</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi note..."
              rows="8"
              className="notes-textarea"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="save-button">
              Salva Note
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NotesModal
