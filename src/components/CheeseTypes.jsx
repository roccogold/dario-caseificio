import { useState, useMemo } from 'react'
import CheeseTypeModal from './CheeseTypeModal'
import ConfirmDialog from './ConfirmDialog'
import { EditIcon, DeleteIcon } from './Icons'
import './Icons.css'
import './CheeseTypes.css'

function CheeseTypes({ cheeses, onSaveCheese, onDeleteCheese }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCheese, setEditingCheese] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleAdd = () => {
    setEditingCheese(null)
    setIsModalOpen(true)
  }

  const handleEdit = (cheese) => {
    setEditingCheese(cheese)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    setConfirmDialog({
      title: 'Elimina Tipo di Formaggio',
      message: 'Sei sicuro di voler eliminare questo tipo di formaggio? Questa azione non può essere annullata.',
      onConfirm: async () => {
        try {
          await onDeleteCheese(id)
          setConfirmDialog(null)
        } catch (error) {
          console.error('Error deleting cheese:', error)
          setConfirmDialog(null)
        }
      },
      onCancel: () => setConfirmDialog(null)
    })
  }

  const handleSave = async (cheeseData) => {
    try {
      const cheeseToSave = editingCheese 
        ? { ...cheeseData, id: editingCheese.id }
        : { ...cheeseData, id: `temp-${Date.now()}` }
      
      await onSaveCheese(cheeseToSave)
      setIsModalOpen(false)
      setEditingCheese(null)
    } catch (error) {
      console.error('Error saving cheese:', error)
    }
  }

  // Filtra i formaggi in base al termine di ricerca (solo per nome)
  const filteredCheeses = useMemo(() => {
    if (!searchTerm.trim()) {
      return cheeses
    }
    const term = searchTerm.toLowerCase().trim()
    return cheeses.filter(cheese => 
      cheese.name.toLowerCase().includes(term)
    )
  }, [cheeses, searchTerm])

  return (
    <div className="cheese-types">
      <div className="cheese-types-header">
        <div>
          <h2 className="section-title">Tipi di Formaggio</h2>
          <p className="section-subtitle">Tipi di formaggio disponibili per la produzione</p>
        </div>
        <button className="add-button" onClick={handleAdd}>
          Aggiungi Nuovo Formaggio
        </button>
      </div>

      {cheeses.length > 0 && (
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Cerca formaggio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {cheeses.length === 0 ? (
        <div className="empty-state">
          <p>Nessun formaggio aggiunto. Usa il pulsante sopra per aggiungerne uno.</p>
        </div>
      ) : filteredCheeses.length === 0 ? (
        <div className="empty-state">
          <p>Nessun formaggio trovato per "{searchTerm}".</p>
        </div>
      ) : (
        <div className="cheese-list">
          {filteredCheeses.map(cheese => (
            <div key={cheese.id} className="cheese-card">
              <div className="cheese-card-header">
                <div className="cheese-header-left">
                  <div 
                    className="cheese-color-indicator"
                    style={{ backgroundColor: cheese.color || '#FFD700' }}
                  ></div>
                  <h3>{cheese.name}</h3>
                </div>
                <div className="cheese-card-actions">
                  <button 
                    onClick={() => handleEdit(cheese)} 
                    className="icon-button edit"
                    title="Modifica"
                  >
                    <EditIcon />
                  </button>
                  <button 
                    onClick={() => handleDelete(cheese.id)} 
                    className="icon-button delete"
                    title="Elimina"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
              <div className="protocol-preview">
                <strong>Protocollo:</strong>
                <ul>
                  {[...cheese.protocol].sort((a, b) => a.day - b.day).map((step, idx) => (
                    <li key={idx}>
                      <span className="day-badge">Giorno {step.day}</span>
                      {step.activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CheeseTypeModal
          cheese={editingCheese}
          cheeses={cheeses}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCheese(null)
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

export default CheeseTypes
