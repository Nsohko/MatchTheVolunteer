import {
  calculateDistance,
  calculateDistanceAsync,
} from '../external/googleMaps';
import { Case } from '../../types/case';
import { Volunteer, VolunteerWithDistance } from '../../types/volunteer';

async function distanceBetween(
  caseLocation: string,
  volLocation: string
): Promise<number | null> {
  const distResult =
    typeof UrlFetchApp !== 'undefined'
      ? calculateDistance(caseLocation, volLocation)
      : await calculateDistanceAsync(caseLocation, volLocation);

  if (
    distResult === null ||
    (typeof distResult === 'object' && distResult.error)
  ) {
    return null;
  }
  const dist = typeof distResult === 'number' ? distResult : null;
  if (dist == null || Number.isNaN(dist)) {
    return null;
  }
  return dist;
}

// Finds k-nearest volunteers for volunteerOptions based on caseLocation
export async function findClosestVolunteers(
  caseObj: Case,
  volunteerOptions: Volunteer[],
  k = 5
): Promise<VolunteerWithDistance[]> {
  const caseLocation = caseObj.location;
  const candidates: VolunteerWithDistance[] = [];

  /* Sequential calls: one Distance Matrix request at a time (quota-friendly). */
  /* eslint-disable no-restricted-syntax, no-await-in-loop, no-continue -- sequential matrix API */
  for (const volunteer of volunteerOptions) {
    const volLocation = volunteer.location;
    if (!volLocation) {
      continue;
    }

    const dist = await distanceBetween(caseLocation, volLocation);
    if (dist == null) {
      continue;
    }

    candidates.push({
      volunteer,
      distanceKm: dist,
    });
  }
  /* eslint-enable no-restricted-syntax, no-await-in-loop, no-continue */

  candidates.sort((a, b) => a.distanceKm - b.distanceKm);
  return candidates.slice(0, k);
}
