import { useState } from 'react'
import { findUserByEmail, verifyResetToken, updateUserPassword, saveResetToken } from '../utils/userStorage'
import { generateResetToken } from '../utils/auth'
import './PasswordReset.css'

function PasswordReset({ token, email, onSuccess, onCancel }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Le password non corrispondono')
      return
    }

    // Verify token
    if (!verifyResetToken(email, token)) {
      setError('Token non valido o scaduto')
      return
    }

    setLoading(true)

    const user = findUserByEmail(email)
    if (!user) {
      setError('Utente non trovato')
      setLoading(false)
      return
    }

    const result = updateUserPassword(user.id, newPassword)
    
    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Errore durante l\'aggiornamento della password')
    }
    
    setLoading(false)
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-box">
        <h2>Reimposta Password</h2>
        <p className="reset-info">
          Inserisci la nuova password per l'account <strong>{email}</strong>
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="form-group">
            <label htmlFor="newPassword">Nuova Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minimo 6 caratteri"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Conferma Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Ripeti la password"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="reset-button" disabled={loading}>
              {loading ? 'Aggiornamento...' : 'Reimposta Password'}
            </button>
            <button type="button" className="cancel-button" onClick={onCancel}>
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordReset
