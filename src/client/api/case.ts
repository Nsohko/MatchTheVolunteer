import { serverFunctions } from ".";
import { Case } from "../../types/case";

export async function getCasesList(): Promise<Case[]> {
  return serverFunctions.getCasesList();
}
