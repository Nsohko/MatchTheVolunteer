import { CONFIG } from './config';
import { SheetHelper } from './utility';
import { Volunteer } from './models';
import { Case } from './models';

// ============================================================================
// REPOSITORIES
// ============================================================================

/**
 * Repository for volunteer data access
 */
export class VolunteerRepository {
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

  sheet: GoogleAppsScript.Spreadsheet.Sheet;

  data: unknown[][];

  headerRowIdx: number;

  headers: unknown[];

  constructor() {
    this.spreadsheet = SheetHelper.openSpreadsheet(CONFIG.SHEET_URL);
    this.sheet = SheetHelper.getSheet(this.spreadsheet, CONFIG.VOLUNTEER_SHEET_NAME);
    this.data = SheetHelper.getAllData(this.sheet) as unknown[][];
    this.headerRowIdx = SheetHelper.findHeaderRowIndex(this.data);
    this.headers = this.data[this.headerRowIdx] as unknown[];
  }

  findByCode(code: string): Volunteer | null {
    const trimmedCode = code.trim();
    for (let i = this.headerRowIdx + 1; i < this.data.length; i++) {
      const raw = this.data[i][1];
      const volunteerCode = raw != null ? String(raw).trim() : '';
      if (volunteerCode === trimmedCode) {
        return new Volunteer(volunteerCode, this.data[i] as unknown[], this.headers);
      }
    }
    return null;
  }

  getAll(): Volunteer[] {
    const volunteers: Volunteer[] = [];
    for (let i = this.headerRowIdx + 1; i < this.data.length; i++) {
      const raw = this.data[i][1];
      const volunteerCode = raw != null ? String(raw).trim() : '';
      if (volunteerCode) {
        volunteers.push(new Volunteer(volunteerCode, this.data[i] as unknown[], this.headers));
      }
    }
    return volunteers;
  }
}

/**
 * Repository for case data access
 */
export class CaseRepository {
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

  sheet: GoogleAppsScript.Spreadsheet.Sheet;

  data: unknown[][];

  headers: unknown[];

  constructor() {
    this.spreadsheet = SheetHelper.openSpreadsheet(CONFIG.CASE_SHEET_URL);
    this.sheet = SheetHelper.getSheet(this.spreadsheet, CONFIG.CASE_SHEET_NAME);
    this.data = SheetHelper.getAllData(this.sheet) as unknown[][];
    this.headers = this.data[0] as unknown[];
  }

  findByRowIndex(rowIndex: number): Case | null {
    if (rowIndex < 1 || rowIndex >= this.data.length) {
      return null;
    }
    const row = this.data[rowIndex] as unknown[];
    if (!row || !row[0]) {
      return null;
    }
    return new Case(rowIndex, row, this.headers);
  }

  getAllCases(): { id: string; label: string }[] {
    const cases: { id: string; label: string }[] = [];
    for (let i = 1; i < this.data.length; i++) {
      const sn = this.data[i][0];
      const codeCell = this.data[i][1];
      if (sn && codeCell) {
        cases.push({
          id: i.toString(),
          label: `Case ${sn}: ${codeCell}`,
        });
      }
    }
    return cases;
  }
}
