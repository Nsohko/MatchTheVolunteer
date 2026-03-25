import { invokeRpc } from './transport';
import type {
  ClosestVolunteersResponse,
  Volunteer,
} from '../../types/volunteer';

export async function searchVolunteerByCode(code: string): Promise<Volunteer> {
  return invokeRpc<Volunteer>('searchVolunteerByCode', [code]);
}

export async function getClosestVolunteersForCase(
  caseId: string
): Promise<ClosestVolunteersResponse> {
  return invokeRpc<ClosestVolunteersResponse>('getClosestVolunteersForCase', [
    caseId,
  ]);
}
