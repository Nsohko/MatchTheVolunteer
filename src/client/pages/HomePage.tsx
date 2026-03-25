import { useState } from 'react';
import VolunteerSearch from '../components/VolunteerSearch';
import CaseSearch from '../components/CaseSearch';
type Tab = 'volunteer' | 'case';

function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('volunteer');

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container">
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
