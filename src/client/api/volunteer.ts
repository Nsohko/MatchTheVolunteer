import { isGasAvailable, serverFunctions } from ".";
import { AvailabilitiesFilter, Volunteer, ClosestVolunteersResponse } from "../../types/volunteer";
import { mockGetVolunteersByAvailability, mockSearchVolunteerByCode, mockGetClosestVolunteersForCase } from "./mockData";

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
  filters: AvailabilitiesFilter[] = []
): Promise<ClosestVolunteersResponse> {
    if (isGasAvailable()) {
      return serverFunctions.getClosestVolunteersForCase(caseId, filters);
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockGetClosestVolunteersForCase(caseId)), 300);
    });
  }

export async function getVolunteerByAvailabilities(
  filters: AvailabilitiesFilter[]
): Promise<Volunteer[]> {
  if (isGasAvailable()) {
    return serverFunctions.getVolunteerByAvailabilities(filters);
  }
  return new Promise((resolve) => {
      setTimeout(() => resolve(mockGetVolunteersByAvailability(filters)), 300);
    });
  }
