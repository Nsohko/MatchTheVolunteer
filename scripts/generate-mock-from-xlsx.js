#!/usr/bin/env node
/**
 * Generates mock data from .xlsx files in mock_data/
 * Run: yarn generate-mock
 * Output: src/client/match-the-volunteer/api/mockData.generated.ts
 */

import { writeFileSync } from 'fs';
import { paths, parseXlsx, ensureXlsxFilesExist } from './xlsx-utils.js';

function escapeForTs(val) {
  if (val == null || val === '') return "''";
  if (typeof val === 'number') return String(val);
  return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}'`;
}

function padRow(row, len) {
  const arr = [...(row || [])];
  while (arr.length < len) arr.push('');
  return arr.slice(0, len);
}

function generateMockDataTs(volunteerData, caseData) {
  const vLen = volunteerData.headers.length;
  const cLen = caseData.headers.length;
  const volunteerRows = volunteerData.rows
    .map((row) => `    [${padRow(row, vLen).map((c) => escapeForTs(c)).join(', ')}]`)
    .join(',\n');
  const volunteerHeaders = `[${volunteerData.headers.map((h) => escapeForTs(h)).join(', ')}]`;

  const caseRows = caseData.rows
    .map((row) => `    [${padRow(row, cLen).map((c) => escapeForTs(c)).join(', ')}]`)
    .join(',\n');
  const caseHeaders = `[${caseData.headers.map((h) => escapeForTs(h)).join(', ')}]`;

  return `// AUTO-GENERATED from mock_data/*.xlsx - do not edit manually
// Run: yarn generate-mock

export const volunteerData = {
  headers: ${volunteerHeaders},
  rows: [
${volunteerRows}
  ],
};

export const caseData = {
  headers: ${caseHeaders},
  rows: [
${caseRows}
  ],
};
`;
}

function main() {
  ensureXlsxFilesExist();

  const volunteerData = parseXlsx(paths.volunteer, ['Code Number']);
  const caseData = parseXlsx(paths.case, ['SN']);

  const output = generateMockDataTs(volunteerData, caseData);
  writeFileSync(paths.mockGenerated, output, 'utf-8');
  console.log(`Wrote ${paths.mockGenerated}`);
}

main();
