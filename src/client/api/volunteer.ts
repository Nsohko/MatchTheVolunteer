import { isGasAvailable, serverFunctions } from ".";
import { Volunteer, ClosestVolunteersResponse } from "../../types/volunteer";
import {
  mockSearchVolunteerByCode,
  mockGetClosestVolunteersForCase,
  mockGetVolunteersList,
} from "./mockData";

export async function searchVolunteerByCode(code: string): Promise<Volunteer> {
    if (isGasAvailable()) {
      return serverFunctions.searchVolunteerByCode(code);
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSearchVolunteerByCode(code)), 300);
    });
  }

export async function getClosestVolunteersForCase(caseId: string): Promise<ClosestVolunteersResponse> {
    if (isGasAvailable()) {
      return serverFunctions.getClosestVolunteersForCase(caseId);
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockGetClosestVolunteersForCase(caseId)), 300);
    });
}

export async function getVolunteersList(): Promise<Volunteer[]> {
    if (isGasAvailable()) {
      return serverFunctions.getVolunteersList();
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockGetVolunteersList()), 300);
    });
}
