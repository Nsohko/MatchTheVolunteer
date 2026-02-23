/**
 * Mock data for local development when GAS is not available
 * Uses generated data from mock_data/*.xlsx (run yarn generate-types to update)
 */
import { volunteerData, caseData } from './mockData.generated';
import type { VolunteerResult, CaseItem, CaseResult } from '../../../types';

function getCellByHeader(
  headers: (string | number)[],
  row: (string | number)[],
  headerName: string
): string {
  const idx = findColumnIndex(headers, [headerName.trim()]);
  if (idx === -1) return '';
  const v = row[idx];
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  if (!s || s === 'nan' || s === 'null') return '';
  return s;
}

function findColumnIndex(headers: (string | number)[], searchTerms: string[]): number {
  for (let h = 0; h < headers.length; h++) {
    const header = String(headers[h] || '');
    const normalizedHeader = header.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (searchTerms.some((term) => normalizedHeader.includes(term))) {
      return h;
    }
  }
  return -1;
}

function buildTableFromRow(
  headers: (string | number)[],
  row: (string | number)[],
  maxColumns = 15
): string {
  let html = '<table>';
  for (let j = 0; j < Math.min(row.length, maxColumns); j++) {
    if (row[j] !== null && row[j] !== '') {
      const headerName = headers[j] ? String(headers[j]) : `Column ${j + 1}`;
      const cellVal = String(row[j]);
      html += `<tr><td>${headerName}</td><td>${cellVal}</td></tr>`;
    }
  }
  html += '</table>';
  return html;
}

export function mockSearchVolunteerByCode(code: string): VolunteerResult {
  const trimmed = code.trim().toUpperCase();
  const codeColIdx = findColumnIndex(volunteerData.headers, ['Code Number']);
  if (codeColIdx === -1) {
    return { success: false, data: null };
  }
  const row = volunteerData.rows.find((r) => {
    const cell = r[codeColIdx] != null ? String(r[codeColIdx]).trim().toUpperCase() : '';
    return cell === trimmed;
  });
  if (!row) {
    return { success: false, data: null };
  }
  const html = buildTableFromRow(volunteerData.headers, row);
  return { success: true, data: html };
}

export function mockGetCasesList(): CaseItem[] {
  const snIdx = findColumnIndex(caseData.headers, ['SN']);
  const codeIdx = findColumnIndex(caseData.headers, ['Code']);
  const snCol = snIdx >= 0 ? snIdx : 0;
  const codeCol = codeIdx >= 0 ? codeIdx : 1;

  return caseData.rows.map((row, i) => {
    const sn = row[snCol] != null ? String(row[snCol]) : String(i + 1);
    const code = row[codeCol] != null ? String(row[codeCol]) : `C${String(i + 1).padStart(3, '0')}`;
    return { id: String(i + 1), label: `Case ${sn}: ${code}` };
  });
}

export function mockGetClosestVolunteersForCase(caseId: string): CaseResult {
  const idx = parseInt(caseId, 10) - 1;
  const row = caseData.rows[idx];
  if (!row) {
    return {
      success: true,
      caseBiodata: {
        gender: 'N/A',
        dateOfFirstContact: 'N/A',
        language1: 'N/A',
        patientAddress: 'N/A',
      },
      closestVolunteers: [],
      closestCodes: [],
    };
  }

  const caseBiodata = {
    gender: getCellByHeader(caseData.headers, row, 'Gender') || 'N/A',
    dateOfFirstContact:
      getCellByHeader(caseData.headers, row, 'Date of first contact') || 'N/A',
    language1: getCellByHeader(caseData.headers, row, 'Language 1') || 'N/A',
    patientAddress: getCellByHeader(caseData.headers, row, 'Patient Address') || 'N/A',
  };

  const codeColIdx = findColumnIndex(volunteerData.headers, ['Code Number']);
  const areaColIdx = findColumnIndex(volunteerData.headers, [
    'Which area of Singapore do you live',
    '10. Which area',
  ]);
  const codeCol = codeColIdx >= 0 ? codeColIdx : 0;
  const areaCol = areaColIdx >= 0 ? areaColIdx : 4;

  const closest = volunteerData.rows.slice(0, 5).map((r, i) => ({
    code: String(r[codeCol] ?? `R${String(i + 1).padStart(3, '0')}`),
    distanceKm: `${(2 + i * 0.7).toFixed(2)}`,
    address: `${String(r[areaCol] ?? 'N/A')}, Singapore`,
  }));

  return {
    success: true,
    caseBiodata,
    closestVolunteers: closest,
    closestCodes: closest.map((v) => v.code),
  };
}
