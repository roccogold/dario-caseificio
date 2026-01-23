import './Header.css'

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-top">
        <div className="header-left-section">
          <img 
            src="https://www.corzanoepaterno.com/organic-farm/wp-content/uploads/2020/02/corzanopaternologo.svg" 
            alt="Corzano e Paterno Logo" 
            className="header-logo"
          />
        </div>
        <div className="header-center-section">
          <div className="header-dario-brand">
            <span className="header-dario-logo">DARIO</span>
            <span className="header-dario-tagline">Il Tuo Diario di Produzione</span>
          </div>
        </div>
        <div className="header-right-section">
          {user && (
            <div className="header-user-menu">
              <span className="user-name">{user.email || user.username || 'Utente'}</span>
              <button className="logout-button" onClick={onLogout}>
                Esci
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="header-subtitle-section">
        <p className="header-subtitle">
          Gestisci la tua produzione artigianale di formaggi con precisione e cura
        </p>
      </div>
    </header>
  )
}

export default Header
