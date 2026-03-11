import { CaseRepository } from "../repository/CaseRepository";
import { VolunteerRepository } from "../repository/VolunteerRepository";
import { ClosestVolunteersResponse, Volunteer } from "../../types/volunteer";
import { findClosestVolunteers } from "../matching/location";

export function getVolunteersList(): Volunteer[] {
  const repository = new VolunteerRepository();
  const allVolunteers = repository.getAll();
  console.log(`[DEBUG] getVolunteersList returned ${allVolunteers.length} volunteers`);
  return allVolunteers;
}

export function searchVolunteerByCode(code: string): Volunteer {
  const repository = new VolunteerRepository();
  const volunteer = repository.findByCode(code);
  if (!volunteer) {
    throw new Error(`Volunteer not found with code: ${code}`);
  }
  return volunteer;
}

export interface VolunteerFilters {
  gender?: string | null;
  religions?: string[];
  languages?: string[];
}

export function getClosestVolunteersForCase(
  caseRowId: string,
  k = 5,
  filters?: VolunteerFilters
): ClosestVolunteersResponse {
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

      // Apply filters to get filtered volunteers
      let volunteers = volunteerRepository.getAll();
      console.log(`[DEBUG] Initial volunteers: ${volunteers.length}`);

      if (filters?.gender) {
        volunteers = volunteerRepository.getByGender(filters.gender);
        console.log(`[DEBUG] After gender filter (${filters.gender}): ${volunteers.length}`);
      }

      if (filters?.religions && filters.religions.length > 0) {
        const religiousVolunteers = volunteerRepository.getByReligion(filters.religions);
        volunteers = volunteers.filter(v => religiousVolunteers.some(rv => rv.code === v.code));
        console.log(`[DEBUG] After religion filter: ${volunteers.length}`);
      }

      if (filters?.languages && filters.languages.length > 0) {
        const languageVolunteers = volunteerRepository.getByLanguages(filters.languages);
        volunteers = volunteers.filter(v => languageVolunteers.some(lv => lv.code === v.code));
        console.log(`[DEBUG] After language filter: ${volunteers.length}`);
      }

      const closestVolunteers = findClosestVolunteers(caseObj, volunteers, k);

      console.log(`[DEBUG] Final result: ${closestVolunteers.length} volunteers returned`);
      return closestVolunteers;
    } catch (error) {
      console.log(`[DEBUG] Error: ${(error as Error).toString()}`);
      throw new Error(`Error finding closest volunteers: ${(error as Error).toString()}`);
    }
  }
