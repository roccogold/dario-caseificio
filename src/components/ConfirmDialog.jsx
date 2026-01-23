import './ConfirmDialog.css'

function ConfirmDialog({ isOpen, title, message, confirmText = 'Conferma', cancelText = 'Annulla', onConfirm, onCancel, type = 'danger' }) {
  if (!isOpen) return null

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <div className="confirm-icon">
            {type === 'danger' ? '⚠️' : 'ℹ️'}
          </div>
          <h3 className="confirm-title">{title}</h3>
        </div>
        <div className="confirm-body">
          <p className="confirm-message">{message}</p>
        </div>
        <div className="confirm-actions">
          <button
            className="confirm-button cancel-button"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-button ${type}-button`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
