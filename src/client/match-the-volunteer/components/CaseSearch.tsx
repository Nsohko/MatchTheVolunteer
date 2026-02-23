import { useState, useEffect } from 'react';
import { getCasesList, getClosestVolunteersForCase } from '../api';
import type { CaseItem, CaseResult } from '../../../types';

function CaseSearch() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingCaseData, setLoadingCaseData] = useState(false);
  const [caseResult, setCaseResult] = useState<CaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!selectedCaseId) {
      setCaseResult(null);
      setError(null);
      return;
    }

    setLoadingCaseData(true);
    setCaseResult(null);
    setError(null);

    getClosestVolunteersForCase(selectedCaseId)
      .then((result) => {
        setLoadingCaseData(false);
        setCaseResult(result);
      })
      .catch((err: Error) => {
        setLoadingCaseData(false);
        setError(err.message);
      });
  }, [selectedCaseId]);

  const renderCaseResult = () => {
    if (error) {
      return (
        <div className="result error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (!caseResult) return null;

    if (!caseResult.success) {
      return (
        <div className="result error">
          <h3>Error</h3>
          <p>Could not load case details.</p>
        </div>
      );
    }

    const { caseBiodata, closestVolunteers = [], closestCodes = [], debug } = caseResult;

    return (
      <div className="result">
        {caseBiodata && (
          <>
            <h3>Case Biodata</h3>
            <table style={{ marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td>
                    <strong>Gender:</strong>
                  </td>
                  <td>{caseBiodata.gender || 'N/A'}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Date of First Contact:</strong>
                  </td>
                  <td>{caseBiodata.dateOfFirstContact || 'N/A'}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Language 1:</strong>
                  </td>
                  <td>{caseBiodata.language1 || 'N/A'}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Patient Address:</strong>
                  </td>
                  <td>{caseBiodata.patientAddress || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
        <h3>Top 5 Closest Volunteers</h3>
        {!closestVolunteers.length && !closestCodes.length ? (
          <>
            <p>No volunteers with valid locations found.</p>
            {debug && (
              <p style={{ fontSize: '12px', color: '#666' }}>
                Debug: Checked {debug.volunteersChecked} volunteers, {debug.volunteersWithLocation}{' '}
                with location, {debug.volunteersWithDistance} with distance.
                {debug.areaColIdx !== undefined && ` Area column index: ${debug.areaColIdx}`}
                {debug.headerRowIdx !== undefined && `, Header row: ${debug.headerRowIdx}`}
                {debug.totalHeaders !== undefined && `, Total columns: ${debug.totalHeaders}`}
                {debug.apiErrors && debug.apiErrors > 0 && (
                  <>
                    , API errors: {debug.apiErrors}
                    {debug.firstError && ` (First: ${debug.firstError})`}
                    {debug.apiErrorDetails && (
                      <>
                        <br />
                        API Error: {debug.apiErrorDetails}
                      </>
                    )}
                  </>
                )}
              </p>
            )}
          </>
        ) : closestVolunteers.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Distance (km)</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {closestVolunteers.map((vol) => (
                <tr key={vol.code}>
                  <td>
                    <strong>{vol.code}</strong>
                  </td>
                  <td>{vol.distanceKm}</td>
                  <td>{vol.address || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>
            {closestCodes.map((c, i) => (
              <span key={c}>
                {i > 0 && ', '}
                <strong>{c}</strong>
              </span>
            ))}
          </p>
        )}
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
              {c.label}
            </option>
          ))}
        </select>
      </div>
      {loadingCaseData && <div className="loading">Loading...</div>}
      {renderCaseResult()}
    </>
  );
}

export default CaseSearch;
