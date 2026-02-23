import { CaseRepository } from "../repository/CaseRepository";
import { VolunteerRepository } from "../repository/VolunteerRepository";
import { Volunteer } from "../../types/volunteer";
import { findClosestVolunteers } from "../matching/location";

export function searchVolunteerByCode(code: string): Volunteer {
  const repository = new VolunteerRepository();
  const volunteer = repository.findByCode(code);
  if (!volunteer) {
    throw new Error(`Volunteer not found with code: ${code}`);
  }
  return volunteer;
}

export function getClosestVolunteersForCase(
    caseRowId: string,
    k = 5
  ): Volunteer[] {
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

      const closestVolunteers = findClosestVolunteers(caseObj, volunteers, k);

      return closestVolunteers;
    } catch (error) {
      throw new Error(`Error finding closest volunteers: ${(error as Error).toString()}`);
    }
  }
