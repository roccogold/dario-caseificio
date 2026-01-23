import { useState } from 'react'
import { format } from 'date-fns'
import { formatDateCapitalized } from '../utils/dateFormat'
import { EditIcon, DeleteIcon, NoteIcon } from './Icons'
import NotesModal from './NotesModal'
import './Icons.css'
import './ProductionsList.css'

function ProductionsList({ productions, cheeses, onEdit, onDelete, onUpdateNotes }) {
  const [notesModalProduction, setNotesModalProduction] = useState(null)
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

  return (
    <div className="productions-list">
      <h3 className="view-title">Produzioni Programmate</h3>
      
      {productions.length === 0 ? (
        <div className="empty-state">
          <p>Nessuna produzione programmata.</p>
        </div>
      ) : (
        <div className="productions-grid">
          {productions.map(production => (
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
                    onClick={() => onEdit(production)}
                    title="Modifica"
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={() => onDelete(production.id)}
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
          onSave={(notes) => {
            onUpdateNotes(notesModalProduction.id, notes)
            setNotesModalProduction(null)
          }}
          onClose={() => setNotesModalProduction(null)}
        />
      )}
    </div>
  )
}

export default ProductionsList
