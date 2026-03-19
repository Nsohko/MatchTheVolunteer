import { isGasAvailable, serverFunctions } from ".";
import { Volunteer, ClosestVolunteersResponse, VolunteerFilters } from "../../types/volunteer";
import { mockSearchVolunteerByCode, mockGetMatchingVolunteersForCase, mockGetVolunteersList } from "./mockData";

export async function getVolunteersList(): Promise<Volunteer[]> {
  if (isGasAvailable()) {
    return serverFunctions.getVolunteersList();
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockGetVolunteersList()), 300);
  });
}

export async function searchVolunteerByCode(code: string): Promise<Volunteer> {
    if (isGasAvailable()) {
      return serverFunctions.searchVolunteerByCode(code);
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSearchVolunteerByCode(code)), 300);
    });
  }

export async function getMatchingVolunteersForCase(
  caseId: string,
  filters?: VolunteerFilters,
  k?: number
): Promise<ClosestVolunteersResponse> {
    if (isGasAvailable()) {
      // TODO: Rename to getMatchingVolunteersForCase in serverFunctions once logic is implemented
      return serverFunctions.getClosestVolunteersForCase(caseId, k || 5, filters);
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockGetMatchingVolunteersForCase(caseId, filters, k)), 300);
    });
  }
