// ============================================================================
// UTILITY CLASSES
// ============================================================================

/**
 * Utility class for Google Sheets operations
 */
export class SheetHelper {
  static openSpreadsheet(url: string): GoogleAppsScript.Spreadsheet.Spreadsheet {
    try {
      return SpreadsheetApp.openByUrl(url);
    } catch (error) {
      throw new Error(`Failed to open spreadsheet: ${(error as Error).toString()}`);
    }
  }

  static getSheet(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    sheetName: string
  ): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }
    return sheet;
  }

  static getAllData(sheet: GoogleAppsScript.Spreadsheet.Sheet): unknown[][] {
    return sheet.getDataRange().getValues();
  }

  static findHeaderRowIndex(
    data: unknown[][],
    identifierColumns: string[] = ['Code Number', 'SN']
  ): number {
    for (let r = 0; r < Math.min(5, data.length); r++) {
      const row = data[r] as unknown[];
      for (let c = 0; c < row.length; c++) {
        const cell = row[c] ? (row[c] as object).toString() : '';
        if (identifierColumns.some((id) => cell.includes(id))) {
          return r;
        }
      }
    }
    return 0;
  }

  static getCellByHeader(headers: unknown[], row: unknown[], headerName: string): string {
    const idx = (headers as string[]).indexOf(headerName);
    if (idx === -1) return '';
    const v = row[idx];
    if (v === null || v === undefined) return '';
    const s = (v as object).toString().trim();
    if (!s || s === 'nan' || s === 'null') return '';
    return s;
  }

  static findColumnIndex(headers: unknown[], searchTerms: string[]): number {
    for (let h = 0; h < headers.length; h++) {
      const header = headers[h] ? (headers[h] as object).toString() : '';
      const normalizedHeader = header.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      if (searchTerms.some((term) => normalizedHeader.includes(term))) {
        return h;
      }
    }
    return -1;
  }
}

/**
 * Utility class for HTML generation
 */
export class HtmlBuilder {
  static buildTableFromRow(headers: unknown[], row: unknown[], maxColumns = 15): string {
    let html = '<table>';
    for (let j = 0; j < Math.min(row.length, maxColumns); j++) {
      if (row[j] !== null && row[j] !== '') {
        const headerName = headers[j] ? (headers[j] as object).toString() : `Column ${j + 1}`;
        html += `<tr><td>${headerName}</td><td>${row[j]}</td></tr>`;
      }
    }
    html += '</table>';
    return html;
  }

  static buildVolunteersTable(
    volunteers: { code: string; distanceKm: string; address?: string }[]
  ): string {
    if (!volunteers || volunteers.length === 0) {
      return '<p>No volunteers with valid locations found.</p>';
    }
    let html = '<table>';
    html += '<tr><th>Code</th><th>Distance (km)</th><th>Address</th></tr>';
    volunteers.forEach((vol) => {
      html += '<tr>';
      html += `<td><strong>${vol.code}</strong></td>`;
      html += `<td>${vol.distanceKm}</td>`;
      html += `<td>${vol.address || 'N/A'}</td>`;
      html += '</tr>';
    });
    html += '</table>';
    return html;
  }

  static buildCaseBiodataTable(biodata: {
    gender?: string;
    dateOfFirstContact?: string;
    language1?: string;
    patientAddress?: string;
  }): string {
    let html = '<h3>Case Biodata</h3>';
    html += '<table style="margin-bottom: 20px;">';
    html += `<tr><td><strong>Gender:</strong></td><td>${biodata.gender || 'N/A'}</td></tr>`;
    html += `<tr><td><strong>Date of First Contact:</strong></td><td>${biodata.dateOfFirstContact || 'N/A'}</td></tr>`;
    html += `<tr><td><strong>Language 1:</strong></td><td>${biodata.language1 || 'N/A'}</td></tr>`;
    html += `<tr><td><strong>Patient Address:</strong></td><td>${biodata.patientAddress || 'N/A'}</td></tr>`;
    html += '</table>';
    return html;
  }
}
