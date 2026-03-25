import { serverFunctions } from ".";
import { Volunteer, ClosestVolunteersResponse } from "../../types/volunteer";

export async function searchVolunteerByCode(code: string): Promise<Volunteer> {
  return serverFunctions.searchVolunteerByCode(code);
}

export async function getClosestVolunteersForCase(
  caseId: string
): Promise<ClosestVolunteersResponse> {
  return serverFunctions.getClosestVolunteersForCase(caseId);
}
