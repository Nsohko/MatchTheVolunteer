import { useState, useCallback } from 'react';
import { searchVolunteerByCode } from '../api';

function VolunteerSearch() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [, setError] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setResult('Please enter a volunteer code number.');
      setIsError(true);
      setError(null);
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setIsError(false);

    try {
      const res = await searchVolunteerByCode(trimmedCode);
      setLoading(false);
      if (res.success && res.data) {
        setResult(res.data);
        setIsError(false);
      } else {
        setResult(`No volunteer found with code: ${trimmedCode}`);
        setIsError(true);
      }
    } catch (err) {
      setLoading(false);
      setResult(err instanceof Error ? err.message : 'Unknown error');
      setIsError(true);
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
      {result && (
        <div className={`result ${isError ? 'error' : ''}`}>
          <h3>
            {isError
              ? result.includes('No volunteer found')
                ? 'Not Found'
                : 'Error'
              : 'Volunteer Found'}
          </h3>
          <div
            className="result-content"
            dangerouslySetInnerHTML={{
              __html: isError ? `<p>${result}</p>` : result,
            }}
          />
        </div>
      )}
    </>
  );
}

export default VolunteerSearch;
