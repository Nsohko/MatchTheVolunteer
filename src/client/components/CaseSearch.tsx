import { useState, useEffect } from 'react';
import { getCasesList } from '../api/case';
import { getClosestVolunteersForCase, type VolunteerFilters } from '../api/volunteer';
import { Case, getCaseLabel } from '../../types/case';
import { ClosestVolunteersResponse } from '../../types/volunteer';

const GENDER_OPTIONS = ['Male', 'Female'];
const RELIGION_OPTIONS = ['Buddhist', 'Catholic/Christian', 'Hindu', 'Muslim', 'Taoist', 'Others', 'No Religion'];

function CaseSearch() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [closestVolunteers, setClosestVolunteers] = useState<ClosestVolunteersResponse>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter UI state (not yet applied)
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedReligions, setSelectedReligions] = useState<string[]>([]);
  const [closestVolunteerCount, setClosestVolunteerCount] = useState<string>('');

  // Active filters applied when Search is clicked
  const [activeFilters, setActiveFilters] = useState<VolunteerFilters | null>(null);
  const [activeK, setActiveK] = useState<number | null>(null);

  // Load cases
  useEffect(() => {
    setLoadingCases(true);
    getCasesList()
      .then((casesList) => {
        setLoadingCases(false);
        setCases(casesList || []);
      })
      .catch(() => {
        setLoadingCases(false);
        setCases([]);
      });
  }, []);

  // Handle case selection
  useEffect(() => {
    if (!selectedCaseId) {
      setSelectedCase(null);
      setClosestVolunteers([]);
      setActiveFilters(null);
      setError(null);
      return;
    }

    const c = cases.find((x) => x.id === selectedCaseId) ?? null;
    setSelectedCase(c);
    setClosestVolunteers([]);
    setActiveFilters(null);
    setError(null);
  }, [selectedCaseId, cases]);

  // Handle filter search
  useEffect(() => {
    if (!selectedCaseId || !activeFilters) return;

    setLoadingVolunteers(true);
    setClosestVolunteers([]);
    setError(null);

    const c = cases.find((x) => x.id === selectedCaseId);
    if (!c) return;

    getClosestVolunteersForCase(selectedCaseId, activeFilters, activeK)
      .then((result) => {
        setLoadingVolunteers(false);
        setClosestVolunteers(result);
      })
      .catch((err: Error) => {
        setLoadingVolunteers(false);
        setError(err.message);
      });
  }, [selectedCaseId, activeFilters, activeK, cases]);

  const handleReligionChange = (religion: string) => {
    setSelectedReligions((prev) =>
      prev.includes(religion) ? prev.filter((r) => r !== religion) : [...prev, religion]
    );
  };

  const handleAnyReligion = () => {
    setSelectedReligions(RELIGION_OPTIONS);
  };

  const handleSearch = () => {
    const k = closestVolunteerCount ? parseInt(closestVolunteerCount, 10) : null;
    if (k !== null && Number.isNaN(k)) {
      setError('Please enter a valid number for closest volunteers');
      return;
    }

    const filters: VolunteerFilters = {
      gender: selectedGender || undefined,
      religions: selectedReligions.length > 0 ? selectedReligions : undefined,
    };
    setActiveFilters(filters);
    setActiveK(k);
  };

  const renderVolunteerResults = () => {
    const hasDistances = closestVolunteers.some(({ distanceKm }) => distanceKm > 0);
    
    return (
      <div className="result">
        <h3>Matching Volunteers</h3>
        {!closestVolunteers.length ? (
          <p>No volunteers found matching your filters.</p>
        ) : (
          <>
            {!hasDistances && (
              <p style={{ color: '#ff9800', marginBottom: '15px', fontStyle: 'italic' }}>
                ⓘ Distance calculation is not available yet. Case addresses are required to rank volunteers by proximity.
              </p>
            )}
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>{hasDistances ? 'Distance (km)' : 'Status'}</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {closestVolunteers.map(({ volunteer: vol, distanceKm }) => (
                  <tr key={vol.code}>
                    <td><strong>{vol.code}</strong></td>
                    <td>{hasDistances ? distanceKm.toFixed(2) : 'Pending'}</td>
                    <td>{vol.location || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    );
  };

  const renderCaseResult = () => {
    if (error) {
      return (
        <div className="result error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (!selectedCaseId) return null;

    return (
      <div className="result">
        {selectedCase && (
          <>
            <h3>Case Biodata</h3>
            <table style={{ marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td><strong>Gender:</strong></td>
                  <td>{selectedCase.gender || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Date of First Contact:</strong></td>
                  <td>{selectedCase.dateOfFirstContact || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Language 1:</strong></td>
                  <td>{selectedCase.language1 || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Patient Address:</strong></td>
                  <td>{selectedCase.patientAddress || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        <div className="filters" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h4>Filter Volunteers</h4>

          <div className="filter-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}><strong>Gender:</strong></label>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="gender"
                  value=""
                  checked={selectedGender === null}
                  onChange={() => setSelectedGender(null)}
                />
                Any
              </label>
              {GENDER_OPTIONS.map((gender) => (
                <label key={gender} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={selectedGender === gender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                  />
                  {gender}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}><strong>Religion:</strong></label>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              {RELIGION_OPTIONS.map((religion) => (
                <label key={religion} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={selectedReligions.includes(religion)}
                    onChange={() => handleReligionChange(religion)}
                  />
                  {religion}
                </label>
              ))}
              <button
                onClick={handleAnyReligion}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#e0e0e0',
                  border: '1px solid #999',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Any
              </button>
            </div>
          </div>

          <div className="filter-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}><strong>Find Closest Volunteers (optional):</strong></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                placeholder="e.g., 5"
                value={closestVolunteerCount}
                onChange={(e) => setClosestVolunteerCount(e.target.value)}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '80px',
                }}
                min="1"
              />
              <span style={{ fontSize: '14px', color: '#666' }}>volunteers</span>
            </div>
          </div>

          <button
            onClick={handleSearch}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Search
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <h3>Search by Case & Volunteer</h3>
      <div className="form-group">
        <label htmlFor="caseDropdown">Select Case:</label>
        <select
          id="caseDropdown"
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          disabled={loadingCases}
        >
          <option value="">
            {loadingCases ? 'Loading cases...' : 'Select a case...'}
          </option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {getCaseLabel(c)}
            </option>
          ))}
        </select>
      </div>

      {renderCaseResult()}
      {loadingVolunteers ?  (
        <div className="loading">Loading...</div>
      ) : (activeFilters ? renderVolunteerResults() : null)}
    </>
  );
}

export default CaseSearch;
