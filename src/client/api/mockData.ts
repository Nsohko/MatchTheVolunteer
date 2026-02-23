/**
 * Mock API implementations for local dev when GAS is unavailable.
 * Uses volunteerData and caseData from mockData.generated (run yarn generate-mock).
 */
import { Case } from '../../types/case';
import { Volunteer, ClosestVolunteersResponse, VolunteerWithDistance } from '../../types/volunteer';
import { volunteerData, caseData } from './mockData.generated';

function findColIdx(headers: string[], terms: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const h = (headers[i] ?? '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (terms.some((t) => h.includes(t))) return i;
  }
  return -1;
}

function getVal(row: (string | number)[], colIdx: number): string {
  if (colIdx < 0) return '';
  const v = row[colIdx];
  if (v == null || v === '') return '';
  const s = String(v).trim();
  return s && s !== 'nan' && s !== 'null' ? s : '';
}

function rowToVolunteer(headers: string[], row: (string | number)[]): Volunteer {
  const codeIdx = findColIdx(headers, ['Code Number']);
  const areaIdx = findColIdx(headers, ['Which area', 'area of Singapore']);
  const snIdx = findColIdx(headers, ['SN']);
  const givenIdx = findColIdx(headers, ['Given Name', '名字']);
  const lastIdx = findColIdx(headers, ['Last Name', '姓氏']);
  const emailIdx = findColIdx(headers, ['Email', '电邮']);
  const contactIdx = findColIdx(headers, ['Contact number', '联络号码']);
  const genderIdx = findColIdx(headers, ['Gender', '性别']);
  const area = getVal(row, areaIdx);
  const location = area ? `${area}, Singapore` : null;

  const empty = '';
  return {
    sn: getVal(row, snIdx),
    code: getVal(row, codeIdx),
    location,
    staffRemarks: empty,
    active: empty,
    reasonForStatus: empty,
    dateOfExit: empty,
    reasonForExit: empty,
    dateOfApplication: empty,
    residingRegion: empty,
    salutation: empty,
    givenName: getVal(row, givenIdx),
    lastName: getVal(row, lastIdx),
    email: getVal(row, emailIdx),
    dateOfBirth: empty,
    contactNumber: getVal(row, contactIdx),
    gender: getVal(row, genderIdx),
    ageRange: empty,
    religion: empty,
    area,
    languagePreferenceForTraining: empty,
    volunteeringExperiences: empty,
    volunteerExperienceDetails: empty,
    trainingCourses: empty,
    trainingCourseDetails: empty,
    spokenLanguages: empty,
    isFamilyCaregiver: empty,
    lostSomeoneRecent: empty,
    employmentStatus: empty,
    availabilities: {},
    appliesToMe: empty,
    interestsHobbiesTalents: empty,
    volunteerOptions: empty,
    volunteerInvolvement: empty,
    emergencyContactName: empty,
    emergencyContactNumber: empty,
    emergencyContactRelationship: empty,
    consentAcknowledgement: empty,
    mailingList: empty,
    howDidYouFindUs: empty,
  };
}

function rowToCase(headers: string[], row: (string | number)[], rowIndex: number): Case {
  const snIdx = findColIdx(headers, ['SN']);
  const codeIdx = findColIdx(headers, ['Code', 'YYYYMM']);
  const addrIdx = findColIdx(headers, ['Patient Address']);
  const genderIdx = findColIdx(headers, ['Gender']);
  const dateIdx = findColIdx(headers, ['Date of first contact']);
  const langIdx = findColIdx(headers, ['Language 1']);
  const addr = getVal(row, addrIdx);
  const location = addr ? `${addr}, Singapore` : '';
  const empty = '';

  return {
    id: String(rowIndex),
    sn: getVal(row, snIdx) || String(rowIndex),
    code: getVal(row, codeIdx),
    location,
    registeredUnder: empty,
    referralPartner: empty,
    designationOfReferringStaff: empty,
    referringStaffName: empty,
    referringStaffContactNumber: empty,
    dateOfFirstContact: getVal(row, dateIdx),
    fy: empty,
    salutation: empty,
    givenName: empty,
    lastName: empty,
    primaryContactNumber: empty,
    primaryContactType: empty,
    secondaryContactNumber: empty,
    secondaryContactType: empty,
    email: empty,
    dateOfBirth: empty,
    stayWithPatient: empty,
    address: empty,
    unitNumber: empty,
    postalCode: empty,
    ageAtReferral: empty,
    gender: getVal(row, genderIdx),
    maritalStatus: empty,
    religion: empty,
    employment: empty,
    language1: getVal(row, langIdx),
    language2: empty,
    patientSalutation: empty,
    patientGivenName: empty,
    patientLastName: empty,
    patientRelationshipToClient: empty,
    patientContactNumber: empty,
    patientBirthDate: empty,
    patientAgeAtReferral: empty,
    patientGender: empty,
    patientAddress: addr,
    patientUnitNumber: empty,
    patientPostalCode: empty,
    patientLanguage1: empty,
    patientLanguage2: empty,
    patientDeceasedDate: empty,
    emergencyContactName: empty,
    emergencyContactForWho: empty,
    emergencyContactRelationship: empty,
    emergencyContactNumber: empty,
    additionalInformation: empty,
    careLead: empty,
    frtMember1: empty,
    frtMember2: empty,
    frtMember3: empty,
    frtMember4: empty,
    frtMember5: empty,
    skillBasedVolunteer1: empty,
    skillBasedVolunteer2: empty,
    skillBasedVolunteer3: empty,
    remarks: empty,
    closedDate: empty,
    reasonForClosedCase: empty,
  };
}

export function mockSearchVolunteerByCode(code: string): Volunteer {
  const trimmed = code.trim();
  const codeIdx = findColIdx(volunteerData.headers, ['Code Number']);
  if (codeIdx < 0) throw new Error(`Volunteer not found with code: ${code}`);

  for (let i = 0; i < volunteerData.rows.length; i++) {
    const row = volunteerData.rows[i] ?? [];
    if (getVal(row, codeIdx) === trimmed) {
      return rowToVolunteer(volunteerData.headers, row);
    }
  }
  throw new Error(`Volunteer not found with code: ${code}`);
}

export function mockGetCasesList(): Case[] {
  const cases: Case[] = [];
  for (let i = 0; i < caseData.rows.length; i++) {
    const row = caseData.rows[i] ?? [];
    const c = rowToCase(caseData.headers, row, i + 1);
    const sn = c.sn;
    const code = c.code;
    if (!sn && !code) continue;
    cases.push(c);
  }
  return cases;
}

export function mockGetClosestVolunteersForCase(caseId: string): ClosestVolunteersResponse {
  const caseIdx = parseInt(caseId, 10);
  if (Number.isNaN(caseIdx) || caseIdx < 1) return [];

  const caseRow = caseData.rows[caseIdx - 1];
  if (!caseRow) return [];

  const caseObj = rowToCase(caseData.headers, caseRow, caseIdx);
  const caseLocation = caseObj.location;
  if (!caseLocation) return [];

  const areaIdx = findColIdx(volunteerData.headers, ['Which area', 'area of Singapore']);
  const candidates: VolunteerWithDistance[] = [];

  for (let i = 0; i < volunteerData.rows.length && candidates.length < 5; i++) {
    const row = volunteerData.rows[i] ?? [];
    const area = getVal(row, areaIdx);
    if (!area) continue;
    const volunteer = rowToVolunteer(volunteerData.headers, row);
    if (!volunteer.location) continue;
    // Mock distance: use index-based fake values (no real API in mock)
    const distanceKm = 1 + candidates.length * 1.5;
    candidates.push({ volunteer, distanceKm });
  }

  return candidates;
}
