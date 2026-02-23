import { useState } from 'react';
import VolunteerSearch from '../components/VolunteerSearch';
import CaseSearch from '../components/CaseSearch';
type Tab = 'volunteer' | 'case';

function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('volunteer');
  const isMockMode =
    typeof (import.meta as { env?: { DEV?: boolean } }).env?.DEV !== 'undefined' &&
    (import.meta as { env?: { DEV?: boolean } }).env?.DEV &&
    typeof (window as { google?: { script?: { run?: unknown } } }).google?.script?.run === 'undefined';

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container">
      {isMockMode && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: 16,
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: 4,
            fontSize: 14,
          }}
        >
          <strong>Dev mode:</strong> Using mock data (GAS not available). Try R001, R002, or R003
          for volunteer search.
        </div>
      )}
      <h2>Volunteer & Case Lookup</h2>

      <div className="tabs">
        <button
          type="button"
          className={`tab-button ${activeTab === 'volunteer' ? 'active' : ''}`}
          onClick={() => switchTab('volunteer')}
        >
          Volunteer Search
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'case' ? 'active' : ''}`}
          onClick={() => switchTab('case')}
        >
          Case Search
        </button>
      </div>

      <div
        id="volunteer"
        className={`tab-content ${activeTab === 'volunteer' ? 'active' : ''}`}
      >
        <VolunteerSearch />
      </div>

      <div id="case" className={`tab-content ${activeTab === 'case' ? 'active' : ''}`}>
        <CaseSearch />
      </div>
    </div>
  );
}

export default HomePage;
