export interface CaseItem {
  id: string;
  label: string;
}

export interface CaseResult {
  success: boolean;
  caseBiodata?: {
    gender: string;
    dateOfFirstContact: string;
    language1: string;
    patientAddress: string;
  };
  closestVolunteers?: { code: string; distanceKm: string; address: string }[];
  closestCodes?: string[];
  debug?: {
    volunteersChecked: number;
    volunteersWithLocation: number;
    volunteersWithDistance: number;
    areaColIdx?: number;
    headerRowIdx?: number;
    totalHeaders?: number;
    apiErrors?: number;
    firstError?: string;
    apiErrorDetails?: string;
  };
}
