import './Tabs.css'

function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="tabs">
      <button
        className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => setActiveTab('calendar')}
      >
        Calendario Produzione
      </button>
      <button
        className={`tab ${activeTab === 'types' ? 'active' : ''}`}
        onClick={() => setActiveTab('types')}
      >
        Tipi di Formaggio
      </button>
    </div>
  )
}

export default Tabs
