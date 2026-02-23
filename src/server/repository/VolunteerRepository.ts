import { CONFIG } from "../config";
import type { Volunteer } from "../../types/volunteer";
import { DAY_HEADER_MAP, DAYS } from "../../types/volunteer";
import { VOLUNTEER_HEADER_MAP } from "../../types/volunteer";
import type { VolunteerRow } from "../../types/sheets";
import { getValueByHeaderMatch, rowToObject } from "./utils";
import { openSpreadsheet, getSheet, getAllData, findHeaderRowIndex } from "../utils/sheets";

function buildAvailabilities(row: VolunteerRow): Record<string, boolean> {
  const availabilities: Record<string, boolean> = {};
  for (const day of DAYS) {
    const val = getValueByHeaderMatch(row, DAY_HEADER_MAP[day]);
    availabilities[day] = val.length > 0;
  }
  return availabilities;
}

function volunteerRowToVolunteer(row: VolunteerRow): Volunteer {
  const area = getValueByHeaderMatch(row, VOLUNTEER_HEADER_MAP.area);
  const location = area ? `${area}, Singapore` : null;

  const get = (key: keyof typeof VOLUNTEER_HEADER_MAP): string =>
    getValueByHeaderMatch(row, VOLUNTEER_HEADER_MAP[key]) || "";

  return {
    sn: get("sn"),
    code: get("code"),
    location,

    staffRemarks: get("staffRemarks"),
    active: get("active"),
    reasonForStatus: get("reasonForStatus"),
    dateOfExit: get("dateOfExit"),
    reasonForExit: get("reasonForExit"),
    dateOfApplication: get("dateOfApplication"),
    residingRegion: get("residingRegion"),

    salutation: get("salutation"),
    givenName: get("givenName"),
    lastName: get("lastName"),
    email: get("email"),
    dateOfBirth: get("dateOfBirth"),
    contactNumber: get("contactNumber"),
    gender: get("gender"),
    ageRange: get("ageRange"),
    religion: get("religion"),
    area: get("area"),

    languagePreferenceForTraining: get("languagePreferenceForTraining"),
    volunteeringExperiences: get("volunteeringExperiences"),
    volunteerExperienceDetails: get("volunteerExperienceDetails"),
    trainingCourses: get("trainingCourses"),
    trainingCourseDetails: get("trainingCourseDetails"),
    spokenLanguages: get("spokenLanguages"),
    isFamilyCaregiver: get("isFamilyCaregiver"),
    lostSomeoneRecent: get("lostSomeoneRecent"),
    employmentStatus: get("employmentStatus"),

    availabilities: buildAvailabilities(row),

    appliesToMe: get("appliesToMe"),
    interestsHobbiesTalents: get("interestsHobbiesTalents"),
    volunteerOptions: get("volunteerOptions"),
    volunteerInvolvement: get("volunteerInvolvement"),

    emergencyContactName: get("emergencyContactName"),
    emergencyContactNumber: get("emergencyContactNumber"),
    emergencyContactRelationship: get("emergencyContactRelationship"),
    consentAcknowledgement: get("consentAcknowledgement"),
    mailingList: get("mailingList"),
    howDidYouFindUs: get("howDidYouFindUs"),
  };
}

/**
 * Repository for volunteer data access.
 * Converts raw sheet data to VolunteerRow[] and maps to Volunteer with normalised field names.
 */
export class VolunteerRepository {
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

  sheet: GoogleAppsScript.Spreadsheet.Sheet;

  data: VolunteerRow[];

  constructor() {
    this.spreadsheet = openSpreadsheet(CONFIG.SHEET_URL);
    this.sheet = getSheet(this.spreadsheet, CONFIG.VOLUNTEER_SHEET_NAME);
    const rawData = getAllData(this.sheet) as (string | number)[][];
    const headerRowIdx = findHeaderRowIndex(rawData, ["Code Number"]);
    const headers = (rawData[headerRowIdx] ?? []).map((h) => String(h ?? ""));

    this.data = rawData
      .slice(headerRowIdx + 1)
      .filter((row) => row && row.some((c) => c != null && c !== ""))
      .map((row) => rowToObject<VolunteerRow>(headers, row));
  }

  findByCode(code: string): Volunteer | null {
    const trimmedCode = code.trim();
    const row = this.data.find((r) => {
      const volunteerCode = getValueByHeaderMatch(r, VOLUNTEER_HEADER_MAP.code);
      return volunteerCode.trim() === trimmedCode;
    });
    if (!row) return null;
    return volunteerRowToVolunteer(row);
  }

  getAll(): Volunteer[] {
    return this.data
      .filter((row) => getValueByHeaderMatch(row, VOLUNTEER_HEADER_MAP.code))
      .map(volunteerRowToVolunteer);
  }
}
