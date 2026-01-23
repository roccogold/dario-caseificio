import { useState } from 'react'
import { signIn, resetPassword } from '../utils/supabaseAuth'
import { findUserByEmail, initializeUsers } from '../utils/userStorage'
import { createSession, hashPassword } from '../utils/auth'
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  // Determina se usare autenticazione locale o Supabase
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isDevelopment) {
        // Autenticazione locale in sviluppo
        initializeUsers() // Assicura che l'utente di default esista
        const user = findUserByEmail(email) || findUserByEmail(email.toLowerCase())
        if (!user) {
          setError('Credenziali non valide')
          setLoading(false)
          return
        }
        
        // Verifica password direttamente confrontando l'hash
        const passwordHash = hashPassword(password)
        if (user.passwordHash === passwordHash) {
          // Crea sessione locale
          createSession(user)
          onLogin()
        } else {
          setError('Credenziali non valide')
        }
      } else {
        // Autenticazione Supabase in produzione
        const result = await signIn(email, password)
        
        if (result.success) {
          onLogin()
        } else {
          setError(result.error || 'Credenziali non valide')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Errore durante l\'accesso')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isDevelopment) {
        // Reset password locale (semplificato - in produzione usa Supabase)
        const user = findUserByEmail(resetEmail) || findUserByEmail(resetEmail.toLowerCase())
        if (!user) {
          setError('Email non trovata')
          setLoading(false)
          return
        }
        // In sviluppo, mostra un messaggio che il reset password non è disponibile
        setError('In modalità sviluppo, il reset password non è disponibile. Usa le credenziali di default.')
        setLoading(false)
        return
      } else {
        // Reset password Supabase in produzione
        const result = await resetPassword(resetEmail)
        if (result.success) {
          setResetSent(true)
        } else {
          setError(result.error || 'Errore durante l\'invio email')
        }
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setError('Errore durante l\'invio email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img 
            src="https://www.corzanoepaterno.com/organic-farm/wp-content/uploads/2020/02/corzanopaternologo.svg" 
            alt="Corzano e Paterno Logo" 
            className="login-logo"
          />
          <div className="dario-brand">
            <span className="dario-logo">DARIO</span>
            <span className="dario-tagline">Il Tuo Diario di Produzione</span>
          </div>
          <p className="login-welcome">
            Il tuo assistente digitale per gestire la produzione artigianale di formaggi con precisione e cura
          </p>
        </div>

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="Inserisci la tua email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Inserisci la tua password"
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>

            <button
              type="button"
              className="forgot-password-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Password dimenticata?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="login-form">
            <h3>Recupera Password</h3>
            <p className="forgot-password-info">
              Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
            </p>

            {error && <div className="error-message">{error}</div>}
            {resetSent && (
              <div className="success-message">
                Email inviata! Controlla la tua casella di posta per le istruzioni.
              </div>
            )}

            <div className="form-group">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                placeholder="Inserisci la tua email"
              />
            </div>

            <button type="submit" className="login-button" disabled={loading || resetSent}>
              {loading ? 'Invio in corso...' : resetSent ? 'Email Inviata' : 'Invia Istruzioni'}
            </button>

            <button
              type="button"
              className="back-link"
              onClick={() => {
                setShowForgotPassword(false)
                setResetEmail('')
                setResetSent(false)
                setError('')
              }}
            >
              ← Torna al login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}


export default Login
