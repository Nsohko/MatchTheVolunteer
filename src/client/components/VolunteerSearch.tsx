import { useState, useCallback } from 'react';
import { searchVolunteerByCode } from '../api';
import { Volunteer } from '../../types/volunteer';

function VolunteerSearch() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [volunteer, setVolunteer] = useState<Volunteer| null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError('Please enter a volunteer code number.');
      setVolunteer(null);
      return;
    }

    setLoading(true);
    setVolunteer(null);
    setError(null);

    try {
      const res = await searchVolunteerByCode(trimmedCode);
      setLoading(false);
      setVolunteer(res);
      setError(null);
    } catch (err) {
      setLoading(false);
      setVolunteer(null);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [code]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <>
      <h3>Search Volunteer by Code</h3>
      <div className="form-group">
        <label htmlFor="volunteerCode">Enter Volunteer Code:</label>
        <input
          type="text"
          id="volunteerCode"
          placeholder="e.g., R002"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>
      <button type="button" onClick={handleSearch}>
        Search Volunteer
      </button>
      {loading && <div className="loading">Searching...</div>}
      {error && (
        <div className="result error">
          <h3>{error.includes('not found') ? 'Not Found' : 'Error'}</h3>
          <p>{error}</p>
        </div>
      )}
      {volunteer && (
        <div className="result">
          <h3>Volunteer Found</h3>
          <table>
            <tbody>
              <tr>
                <td><strong>Code:</strong></td>
                <td>{volunteer.code}</td>
              </tr>
              <tr>
                <td><strong>Name:</strong></td>
                <td>{[volunteer.salutation, volunteer.givenName, volunteer.lastName].filter(Boolean).join(' ') || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{volunteer.email || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Contact:</strong></td>
                <td>{volunteer.contactNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Area:</strong></td>
                <td>{volunteer.area || volunteer.location || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Gender:</strong></td>
                <td>{volunteer.gender || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default VolunteerSearch;
