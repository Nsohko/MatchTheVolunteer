import { Volunteer, AvailabilitiesFilter } from "../../types/volunteer";

export function filterVolunteersByAvailabilities(
    volunteers: Volunteer[],
    filters: AvailabilitiesFilter[]
): Volunteer[] {
  if (!filters.length) return volunteers;

  return volunteers.filter(volunteer => {
    const pass = filters.every(({ day, timeSlot }) => {
      const slots = volunteer.availabilities[day];
      console.log(`checking ${volunteer.code} | ${day} ${timeSlot} | slots:`, slots);
      return slots?.includes(timeSlot);
    });
    return pass;
  });
}