import { isGasAvailable, serverFunctions } from ".";
import { Volunteer, ClosestVolunteersResponse } from "../../types/volunteer";
import { mockSearchVolunteerByCode, mockGetClosestVolunteersForCase, mockGetVolunteersList } from "./mockData";

export interface VolunteerFilters {
  gender?: string | null;
  religions?: string[];
  languages?: string[];
}

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

export async function getClosestVolunteersForCase(
  caseId: string,
  filters?: VolunteerFilters,
  k?: number | null
): Promise<ClosestVolunteersResponse> {
    if (isGasAvailable()) {
      return serverFunctions.getClosestVolunteersForCase(caseId, k || 5, filters);
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockGetClosestVolunteersForCase(caseId, filters, k || 5)), 300);
    });
  }
