/**
 * API layer - uses gas-client when in GAS, mock data for local dev when GAS unavailable
 */
import { GASClient } from 'gas-client';
import type * as ServerTypes from '../../server';
import {
  mockSearchVolunteerByCode,
  mockGetCasesList,
  mockGetClosestVolunteersForCase,
} from './mockData';
import { ClosestVolunteersResponse, Volunteer } from '../../types/volunteer';
import { Case } from '../../types/case';


const { serverFunctions } = new GASClient<typeof ServerTypes>({
  allowedDevelopmentDomains: (origin) =>
    /https:\/\/.*\.googleusercontent\.com$/.test(origin) ||
    /https:\/\/script\.google\.com$/.test(origin) ||
    /localhost/.test(origin) ||
    /127\.0\.0\.1/.test(origin),
});

function isGasAvailable(): boolean {
  return typeof (window as { google?: { script?: { run?: unknown } } }).google?.script?.run !== 'undefined';
}

export async function searchVolunteerByCode(code: string): Promise<Volunteer> {
  if (isGasAvailable()) {
    return serverFunctions.searchVolunteerByCode(code);
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockSearchVolunteerByCode(code)), 300);
  });
}

export async function getCasesList(): Promise<Case[]> {
  if (isGasAvailable()) {
    return serverFunctions.getCasesList();
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockGetCasesList()), 300);
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

export { serverFunctions };
