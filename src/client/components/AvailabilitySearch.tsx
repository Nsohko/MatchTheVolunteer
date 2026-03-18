import { useState } from 'react';
import { DAYS, TIME_SLOTS, AvailabilitiesFilter, Volunteer } from '../../types/volunteer';
import { getVolunteerByAvailabilities } from '../api/volunteer';

function AvailabilitySearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Volunteer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const [selectedSlots, setSelectedSlots] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: Record<string, Record<string, boolean>> = {};
    for (const day of DAYS) {
      init[day] = {};
      for (const slot of TIME_SLOTS) {
        init[day][slot] = false;
      }
    }
    return init;
  });

  const toggleSlot = (day: string, slot: string) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: !prev[day][slot],
      },
    }));
  };

  const toggleAllDay = (day: string) => {
    const allSelected = TIME_SLOTS.every((slot) => selectedSlots[day][slot]);
    setSelectedSlots((prev) => ({
      ...prev,
      [day]: Object.fromEntries(TIME_SLOTS.map((slot) => [slot, !allSelected])),
    }));
  };

  const buildFilters = (): AvailabilitiesFilter[] => {
    const filters: AvailabilitiesFilter[] = [];
    for (const day of DAYS) {
      for (const slot of TIME_SLOTS) {
        if (selectedSlots[day][slot]) {
          filters.push({ day: day as typeof DAYS[number], timeSlot: slot });
        }
      }
    }
    return filters;
  };

  const handleSearch = async () => {
    const filters = buildFilters();
    if (!filters.length) {
      setError('Please select at least one availability slot.');
      return;
    }

    setLoading(true);
    setResults([]);
    setError(null);
    setSearched(true);

    try {
      const res = await getVolunteerByAvailabilities(filters);
      setLoading(false);
      setResults(res);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const clearAll = () => {
    setSelectedSlots(() => {
      const init: Record<string, Record<string, boolean>> = {};
      for (const day of DAYS) {
        init[day] = {};
        for (const slot of TIME_SLOTS) {
          init[day][slot] = false;
        }
      }
      return init;
    });
    setResults([]);
    setSearched(false);
    setError(null);
  };

  const selectedCount = buildFilters().length;

  return (
    <>
      <h3>Search Volunteers by Availability</h3>

      {/* Availability grid */}
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 0 }}>
          <thead>
            <tr>
              <th style={{ width: '30%', textAlign: 'left' }}>Day</th>
              {TIME_SLOTS.map((slot) => (
                <th key={slot} style={{ textAlign: 'center' }}>{slot}</th>
              ))}
              <th style={{ textAlign: 'center' }}>All</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const allSelected = TIME_SLOTS.every((slot) => selectedSlots[day][slot]);
              const anySelected = TIME_SLOTS.some((slot) => selectedSlots[day][slot]);
              return (
                <tr
                  key={day}
                  style={{ backgroundColor: anySelected ? '#f0f8f0' : undefined }}
                >
                  <td style={{ fontWeight: anySelected ? 'bold' : 'normal', color: anySelected ? '#2e7d32' : '#555' }}>
                    {day}
                  </td>
                  {TIME_SLOTS.map((slot) => (
                    <td key={slot} style={{ textAlign: 'center', padding: '10px 8px' }}>
                      <input
                        type="checkbox"
                        checked={selectedSlots[day][slot]}
                        onChange={() => toggleSlot(day, slot)}
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#4caf50' }}
                      />
                    </td>
                  ))}
                  <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => toggleAllDay(day)}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#4caf50' }}
                      title={`Select all slots for ${day}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected summary */}
      {selectedCount > 0 && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#e8f5e9', borderRadius: 4, fontSize: 13, color: '#2e7d32' }}>
          <strong>{selectedCount} slot{selectedCount > 1 ? 's' : ''} selected:</strong>{' '}
          {buildFilters().map(({ day, timeSlot }) => `${day} ${timeSlot}`).join(', ')}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={handleSearch} style={{ flex: 1 }}>
          Search Volunteers
        </button>
        <button
          type="button"
          onClick={clearAll}
          style={{ flex: 0, background: '#757575', minWidth: 80 }}
        >
          Clear
        </button>
      </div>

      {loading && <div className="loading">Searching...</div>}

      {error && (
        <div className="result error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {searched && !loading && !error && (
        <div className="result">
          <h3>
            {results.length === 0
              ? 'No volunteers found for selected availability'
              : `${results.length} volunteer${results.length > 1 ? 's' : ''} found`}
          </h3>
          {results.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Area</th>
                  <th>Matching Slots</th>
                </tr>
              </thead>
              <tbody>
                {results.map((vol) => (
                  <tr key={vol.code}>
                    <td><strong>{vol.code}</strong></td>
                    <td>{[vol.salutation, vol.givenName, vol.lastName].filter(Boolean).join(' ') || 'N/A'}</td>
                    <td>{vol.area || 'N/A'}</td>
                    <td style={{ fontSize: 12 }}>
                      {buildFilters()
                        .filter(({ day, timeSlot }) => vol.availabilities[day]?.includes(timeSlot))
                        .map(({ day, timeSlot }) => `${day} ${timeSlot}`)
                        .join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}

export default AvailabilitySearch;