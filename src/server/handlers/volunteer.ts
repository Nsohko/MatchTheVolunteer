import { CaseRepository } from "../repository/CaseRepository";
import { VolunteerRepository } from "../repository/VolunteerRepository";
import { AvailabilitiesFilter, ClosestVolunteersResponse, Volunteer } from "../../types/volunteer";
import { findClosestVolunteers } from "../matching/location";
import { filterVolunteersByAvailabilities } from "../matching/availabilities";

export function searchVolunteerByCode(code: string): Volunteer {
  const repository = new VolunteerRepository();
  const volunteer = repository.findByCode(code);
  if (!volunteer) {
    throw new Error(`Volunteer not found with code: ${code}`);
  }
  return volunteer;
}

export function getVolunteerByAvailabilities(
  filters: AvailabilitiesFilter[]
): Volunteer[]{
  const volunteerRepository = new VolunteerRepository();
  const volunteers = volunteerRepository.getAll();
  return filterVolunteersByAvailabilities(volunteers, filters);
}

export function getClosestVolunteersForCase(
  caseRowId: string,
  filters: AvailabilitiesFilter[] = [],
  k = 5
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
      const volunteers = volunteerRepository.getAll();

      //Filter volunteers by availabilities first 
      const availableVolunteers = filterVolunteersByAvailabilities(volunteers, filters);

      const closestVolunteers = findClosestVolunteers(caseObj, availableVolunteers, k);
      
      return closestVolunteers;
    } catch (error) {
      throw new Error(`Error finding closest volunteers: ${(error as Error).toString()}`);
    }
  }
