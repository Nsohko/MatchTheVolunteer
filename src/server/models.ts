import { SheetHelper } from './utility';

// ============================================================================
// DATA MODELS
// ============================================================================

/**
 * Volunteer data model
 */
export class Volunteer {
  code: string;

  row: unknown[];

  headers: unknown[];

  constructor(code: string, row: unknown[], headers: unknown[]) {
    this.code = code;
    this.row = row;
    this.headers = headers;
  }

  getLocation(): string | null {
    const areaSearchTerms = [
      'Which area of Singapore do you live',
      '你住在哪一区',
      '10. Which area',
    ];

    let areaColIdx = SheetHelper.findColumnIndex(this.headers, areaSearchTerms);

    if (areaColIdx === -1) {
      for (let h = 18; h <= 21 && h < this.headers.length; h++) {
        const header = this.headers[h] ? (this.headers[h] as object).toString() : '';
        const normalized = header.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        if (normalized.includes('area') || normalized.includes('区') || normalized.includes('10.')) {
          areaColIdx = h;
          break;
        }
      }
    }

    if (areaColIdx >= 0 && areaColIdx < this.row.length && this.row[areaColIdx]) {
      const area = (this.row[areaColIdx] as object).toString().trim();
      if (area && area !== '' && area !== 'nan' && area !== 'null') {
        return `${area}, Singapore`;
      }
    }

    return null;
  }

  toObject(): { code: string; row: unknown[]; headers: unknown[] } {
    return {
      code: this.code,
      row: this.row,
      headers: this.headers,
    };
  }
}

/**
 * Case data model
 */
export class Case {
  rowIndex: number;

  row: unknown[];

  headers: unknown[];

  constructor(rowIndex: number, row: unknown[], headers: unknown[]) {
    this.rowIndex = rowIndex;
    this.row = row;
    this.headers = headers;
  }

  getLocation(): string {
    const patientAddr = SheetHelper.getCellByHeader(this.headers, this.row, 'Patient Address');
    if (!patientAddr) {
      throw new Error('Case location not found (Patient Address is empty).');
    }
    return `${patientAddr}, Singapore`;
  }

  getBiodata(): {
    gender: string;
    dateOfFirstContact: string;
    language1: string;
    patientAddress: string;
  } {
    return {
      gender: SheetHelper.getCellByHeader(this.headers, this.row, 'Gender') || 'N/A',
      dateOfFirstContact:
        SheetHelper.getCellByHeader(this.headers, this.row, 'Date of first contact') || 'N/A',
      language1: SheetHelper.getCellByHeader(this.headers, this.row, 'Language 1') || 'N/A',
      patientAddress: SheetHelper.getCellByHeader(this.headers, this.row, 'Patient Address') || 'N/A',
    };
  }

  getSerialNumber(): unknown {
    return this.row[0];
  }

  getCode(): unknown {
    return this.row[1];
  }
}
