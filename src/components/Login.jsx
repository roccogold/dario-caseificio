import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, resetPassword, isAuthenticated } from '../utils/supabaseAuth'
import { findUserByEmail, findUserByUsername, initializeUsers } from '../utils/userStorage'
import { createSession, hashPassword } from '../utils/auth'
import './Login.css'

function Login() {
  const navigate = useNavigate()
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
        
        // Cerca l'utente per email (case-insensitive)
        const normalizedEmail = email.trim().toLowerCase()
        const user = findUserByEmail(normalizedEmail) || findUserByUsername(normalizedEmail)
        
        if (!user) {
          console.error('User not found:', normalizedEmail)
          setError('Credenziali non valide')
          setLoading(false)
          return
        }
        
        // Verifica password direttamente confrontando l'hash
        const passwordHash = hashPassword(password)
        if (user.passwordHash === passwordHash) {
          // Crea sessione locale
          createSession(user)
          // Log login (solo in produzione, quando Supabase è configurato)
          try {
            await logAction('login', 'user', user.id, { email: normalizedEmail })
          } catch (err) {
            console.warn('Failed to log login action:', err)
          }
          // Reindirizza alla pagina principale
          navigate('/calendario', { replace: true })
          // Ricarica la pagina per aggiornare lo stato di autenticazione
          window.location.reload()
        } else {
          console.error('Password mismatch for user:', normalizedEmail)
          setError('Credenziali non valide')
        }
      } else {
        // Autenticazione Supabase in produzione
        const result = await signIn(email, password)
        
        if (result.success) {
          // Log login
          try {
            await logAction('login', 'user', result.user?.id || null, { email: email })
          } catch (err) {
            console.warn('Failed to log login action:', err)
          }
          // Reindirizza alla pagina principale
          navigate('/calendario', { replace: true })
          // Ricarica la pagina per aggiornare lo stato di autenticazione
          window.location.reload()
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
        // In sviluppo, mostra le credenziali di default
        setResetSent(true)
        setError('')
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-card p-8">
        <div className="flex flex-col items-center text-center mb-8">
          {/* Logo e Branding */}
          <div className="flex items-center gap-4 mb-6">
            <img 
              src="/frog-logo.svg" 
              alt="Dario Frog" 
              className="h-16 w-16 flex-shrink-0"
            />
            <div className="flex flex-col items-start">
              <span 
                className="text-2xl tracking-widest uppercase"
                style={{ 
                  color: '#8B7355',
                  fontFamily: "'TC Galliard Bold', 'Garamond Premier Semibold Caption', 'Garamond Premier Semibold', 'Laurentian Semi Bold', 'EB Garamond', Georgia, serif",
                  fontWeight: 700,
                  letterSpacing: '0.1em'
                }}
              >
                DARIO
              </span>
              <span 
                className="text-xs tracking-wide font-serif"
                style={{ color: '#A68B6F' }}
              >
                Corzano e Paterno
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground font-serif max-w-md">
            Il tuo assistente digitale per gestire la produzione artigianale di formaggi con precisione e cura
          </p>
        </div>

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground font-serif">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="Inserisci la tua email"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-serif focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground font-serif">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Inserisci la tua password"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-serif focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-serif text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors font-serif underline"
            >
              Password dimenticata?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground text-center mb-2 font-serif">
              Recupera Password
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4 font-serif">
              Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
            </p>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 text-center">
                {error}
              </div>
            )}
            {resetSent && (
              <div className="bg-muted border border-border text-foreground text-sm rounded-lg p-4 text-center">
                {isDevelopment ? (
                  <p className="text-muted-foreground">
                    Il reset password non è disponibile in modalità sviluppo.
                  </p>
                ) : (
                  <p>Email inviata! Controlla la tua casella di posta per le istruzioni.</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="reset-email" className="text-sm font-medium text-foreground font-serif">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                placeholder="Inserisci la tua email"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-serif focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || resetSent}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-serif text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Invio in corso...' : resetSent ? 'Email Inviata' : 'Invia Istruzioni'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false)
                setResetEmail('')
                setResetSent(false)
                setError('')
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors font-serif underline"
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
