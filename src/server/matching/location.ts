import { calculateDistance } from "../external/googleMaps";
import { Case } from "../../types/case";
import { Volunteer, VolunteerWithDistance } from "../../types/volunteer";

// Finds k-nearest volunteers for volunteerOptions based on caseLocation
export function findClosestVolunteers(
  caseObj: Case,
  volunteerOptions: Volunteer[],
  k = 5
): VolunteerWithDistance[] {
  const caseLocation = caseObj.location;
  const candidates: VolunteerWithDistance[] = [];

  for (const volunteer of volunteerOptions) {
    const volLocation = volunteer.location;

    if (!volLocation) continue;

    const distResult = calculateDistance(caseLocation, volLocation);

    if (distResult === null || (typeof distResult === 'object' && distResult.error)) {
      continue;
    }

    const dist = typeof distResult === 'number' ? distResult : null;
    if (dist == null || Number.isNaN(dist)) {
      continue;
    }

    candidates.push({
      volunteer,
      distanceKm: dist,
    });
  }

  candidates.sort((a, b) => a.distanceKm - b.distanceKm);
  const topVolunteers = candidates.slice(0, k);

  return topVolunteers;
}
