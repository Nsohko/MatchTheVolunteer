/**
 * Mock data for local development when GAS is not available
 */
import type { VolunteerResult, CaseItem, CaseResult } from '../../../types';

const MOCK_VOLUNTEER_HTML = `
<table>
  <tr><td>Code Number</td><td>R002</td></tr>
  <tr><td>Name</td><td>Jane Doe</td></tr>
  <tr><td>Email</td><td>jane@example.com</td></tr>
  <tr><td>Phone</td><td>+65 9123 4567</td></tr>
  <tr><td>Which area of Singapore do you live</td><td>Yishun</td></tr>
</table>
`.trim();

export const MOCK_CASES: CaseItem[] = [
  { id: '1', label: 'Case 1: C001' },
  { id: '2', label: 'Case 2: C002' },
  { id: '3', label: 'Case 3: C003' },
];

const MOCK_VOLUNTEER_CODES = ['R001', 'R002', 'R003'];

export function mockSearchVolunteerByCode(code: string): VolunteerResult {
  const trimmed = code.trim().toUpperCase();
  if (MOCK_VOLUNTEER_CODES.some((c) => c.toUpperCase() === trimmed)) {
    return { success: true, data: MOCK_VOLUNTEER_HTML };
  }
  return { success: false, data: null };
}

export function mockGetCasesList(): CaseItem[] {
  return MOCK_CASES;
}

export function mockGetClosestVolunteersForCase(_caseId: string): CaseResult {
  return {
    success: true,
    caseBiodata: {
      gender: 'Female',
      dateOfFirstContact: '2024-01-15',
      language1: 'English',
      patientAddress: '123 Yishun Ave 6, Singapore',
    },
    closestVolunteers: [
      { code: 'R001', distanceKm: '2.50', address: 'Yishun, Singapore' },
      { code: 'R002', distanceKm: '3.20', address: 'Sembawang, Singapore' },
      { code: 'R003', distanceKm: '4.10', address: 'Woodlands, Singapore' },
      { code: 'R004', distanceKm: '5.30', address: 'Admiralty, Singapore' },
      { code: 'R005', distanceKm: '6.00', address: 'Marsiling, Singapore' },
    ],
    closestCodes: ['R001', 'R002', 'R003', 'R004', 'R005'],
  };
}
