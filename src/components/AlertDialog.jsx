import './AlertDialog.css'

function AlertDialog({ isOpen, title, message, buttonText = 'OK', onClose, type = 'info' }) {
  if (!isOpen) return null

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className="alert-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="alert-header">
          <div className="alert-icon">
            {type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <h3 className="alert-title">{title || 'Attenzione'}</h3>
        </div>
        <div className="alert-body">
          <p className="alert-message">{message}</p>
        </div>
        <div className="alert-actions">
          <button
            className={`alert-button ${type}-button`}
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertDialog
