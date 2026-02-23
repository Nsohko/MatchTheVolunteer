/**
 * Case data model with normalised camelCase field names.
 * Mapping from sheet headers (CaseRow) is done in the repository layer.
 */
export interface Case {
  id: string;
  sn: string;
  code: string;
  /** Patient Address + ", Singapore" for Maps API */
  location: string;

  // Registration & referral
  registeredUnder: string;
  referralPartner: string;
  designationOfReferringStaff: string;
  referringStaffName: string;
  referringStaffContactNumber: string;

  // Dates & FY
  dateOfFirstContact: string;
  fy: string;

  // Client (caregiver) info
  salutation: string;
  givenName: string;
  lastName: string;
  primaryContactNumber: string;
  primaryContactType: string;
  secondaryContactNumber: string;
  secondaryContactType: string;
  email: string;
  dateOfBirth: string;
  stayWithPatient: string;
  address: string;
  unitNumber: string;
  postalCode: string;
  ageAtReferral: string;
  gender: string;
  maritalStatus: string;
  religion: string;
  employment: string;
  language1: string;
  language2: string;

  // Patient info
  patientSalutation: string;
  patientGivenName: string;
  patientLastName: string;
  patientRelationshipToClient: string;
  patientContactNumber: string;
  patientBirthDate: string;
  patientAgeAtReferral: string;
  patientGender: string;
  patientAddress: string;
  patientUnitNumber: string;
  patientPostalCode: string;
  patientLanguage1: string;
  patientLanguage2: string;
  patientDeceasedDate: string;

  // Emergency contact
  emergencyContactName: string;
  emergencyContactForWho: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;

  // Case management
  additionalInformation: string;
  careLead: string;
  frtMember1: string;
  frtMember2: string;
  frtMember3: string;
  frtMember4: string;
  frtMember5: string;
  skillBasedVolunteer1: string;
  skillBasedVolunteer2: string;
  skillBasedVolunteer3: string;
  remarks: string;
  closedDate: string;
  reasonForClosedCase: string;
}

/** Maps normalised field names to sheet header search terms (for flexible column matching) */
export const CASE_HEADER_MAP: Record<keyof Omit<Case, 'id' | 'location'>, string[]> = {
  sn: ['SN'],
  code: ['Code', 'YYYYMM'],
  registeredUnder: ['Case is registered under'],
  referralPartner: ['Referral Partner'],
  designationOfReferringStaff: ['Designation of Referring Staff'],
  referringStaffName: ['Referring Staff Name'],
  referringStaffContactNumber: ['Referring Staff Contact Number'],
  dateOfFirstContact: ['Date of first contact'],
  fy: ['FY'],
  salutation: ['Salutation'],
  givenName: ['Given Name'],
  lastName: ['Last Name'],
  primaryContactNumber: ['Primary Contact Number'],
  primaryContactType: ['Primary Contact Type'],
  secondaryContactNumber: ['Secondary Contact Number'],
  secondaryContactType: ['Secondary Contact Type'],
  email: ['Email'],
  dateOfBirth: ['Date of Birth'],
  stayWithPatient: ['Stay with Patient'],
  address: ['Address'],
  unitNumber: ['Unit Number'],
  postalCode: ['Postal Code'],
  ageAtReferral: ['Age at Referral'],
  gender: ['Gender'],
  maritalStatus: ['Marital Status'],
  religion: ['Religion'],
  employment: ['Employment'],
  language1: ['Language 1'],
  language2: ['Language 2'],
  patientSalutation: ['Patient Salutation'],
  patientGivenName: ['Patient Given Name'],
  patientLastName: ['Patient Last Name'],
  patientRelationshipToClient: ['Patient Relationship', 'Who is Patient to Client'],
  patientContactNumber: ['Patient Contact Number'],
  patientBirthDate: ['Patient Birth Date'],
  patientAgeAtReferral: ['Patient Age at Referral'],
  patientGender: ['Patient Gender'],
  patientAddress: ['Patient Address'],
  patientUnitNumber: ['Patient Unit Number'],
  patientPostalCode: ['Patient Postal Code'],
  patientLanguage1: ['Patient Language 1'],
  patientLanguage2: ['Patient Language 2'],
  patientDeceasedDate: ["Patient's Deceased Date", 'Deceased Date', 'When Applicable'],
  emergencyContactName: ['Emergency Contact Name'],
  emergencyContactForWho: ['Emergency Contact for Who'],
  emergencyContactRelationship: ['Emergency Contact Relationship'],
  emergencyContactNumber: ['Emergency Contact Number'],
  additionalInformation: ['Additional Information for Case'],
  careLead: ['Care Lead'],
  frtMember1: ['FRT Member 1'],
  frtMember2: ['FRT Member 2'],
  frtMember3: ['FRT Member 3'],
  frtMember4: ['FRT Member 4'],
  frtMember5: ['FRT Member 5'],
  skillBasedVolunteer1: ['Skill-Based Volunteer 1'],
  skillBasedVolunteer2: ['Skill-Based Volunteer 2'],
  skillBasedVolunteer3: ['Skill-Based Volunteer 3'],
  remarks: ['Remarks'],
  closedDate: ['Closed Date'],
  reasonForClosedCase: ['Reason for Closed Case'],
};

export function getCaseLabel(c: Case): string {
  return `Case ${c.sn}: ${c.code}`;
}
