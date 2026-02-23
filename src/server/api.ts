import { HtmlBuilder } from './utility';
import { VolunteerRepository, CaseRepository } from './repositories';
import { VolunteerMatchingService, DistanceService } from './services';

// ============================================================================
// APPLICATION SERVICES (PUBLIC API)
// ============================================================================

/**
 * Main application service
 */
class VolunteerLookupService {
  static searchVolunteerByCode(code: string): { success: boolean; data: string | null } {
    try {
      const repository = new VolunteerRepository();
      const volunteer = repository.findByCode(code);

      if (!volunteer) {
        return { success: false, data: null };
      }

      const html = HtmlBuilder.buildTableFromRow(volunteer.headers, volunteer.row, 15);
      return { success: true, data: html };
    } catch (error) {
      throw new Error(`Error searching volunteer: ${(error as Error).toString()}`);
    }
  }

  static getCasesList(): { id: string; label: string }[] {
    try {
      const repository = new CaseRepository();
      return repository.getAllCases();
    } catch (error) {
      throw new Error(`Error getting cases: ${(error as Error).toString()}`);
    }
  }

  static getClosestVolunteersForCase(
    caseRowId: string,
    k = 5
  ): {
    success: boolean;
    caseLocation: string;
    caseBiodata: {
      gender: string;
      dateOfFirstContact: string;
      language1: string;
      patientAddress: string;
    };
    closestVolunteers: { code: string; distanceKm: string; address: string }[];
    closestCodes: string[];
    debug: {
      volunteersChecked: number;
      volunteersWithLocation: number;
      volunteersWithDistance: number;
      apiErrors?: number;
      firstError?: string;
      apiErrorDetails?: string;
    };
  } {
    try {
      const rowIndex = parseInt(caseRowId, 10);
      if (Number.isNaN(rowIndex) || rowIndex < 1) {
        throw new Error('Invalid caseRowId');
      }

      const caseRepository = new CaseRepository();
      const caseObj = caseRepository.findByRowIndex(rowIndex);

      if (!caseObj) {
        throw new Error(`Case row not found for id: ${caseRowId}`);
      }

      const volunteerRepository = new VolunteerRepository();
      const volunteers = volunteerRepository.getAll();

      const matchingService = new VolunteerMatchingService();
      const result = matchingService.findClosestVolunteers(caseObj, volunteers, k);

      const caseBiodata = caseObj.getBiodata();
      const caseLocation = caseObj.getLocation();

      return {
        success: true,
        caseLocation,
        caseBiodata,
        closestVolunteers: result.volunteers.map((v) => ({
          code: v.code,
          distanceKm: v.distanceKm.toFixed(2),
          address: v.location,
        })),
        closestCodes: result.volunteers.map((v) => v.code),
        debug: result.debug,
      };
    } catch (error) {
      throw new Error(`Error finding closest volunteers: ${(error as Error).toString()}`);
    }
  }

  static testGoogleMapsAPI(): string {
    const distanceService = new DistanceService();
    const result = distanceService.testConnection();
    return result.message;
  }
}

// ============================================================================
// PUBLIC API FUNCTIONS (Called from frontend)
// ============================================================================

export function searchVolunteerByCode(code: string) {
  return VolunteerLookupService.searchVolunteerByCode(code);
}

export function getCasesList() {
  return VolunteerLookupService.getCasesList();
}

export function getClosestVolunteersForCase(caseRowId: string, k = 5) {
  return VolunteerLookupService.getClosestVolunteersForCase(caseRowId, k);
}

export function testGoogleMapsAPI() {
  return VolunteerLookupService.testGoogleMapsAPI();
}
