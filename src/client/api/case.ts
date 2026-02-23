import { isGasAvailable, serverFunctions } from ".";
import { Case } from "../../types/case";
import { mockGetCasesList } from "./mockData";

export async function getCasesList(): Promise<Case[]> {
    if (isGasAvailable()) {
      return serverFunctions.getCasesList();
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockGetCasesList()), 300);
    });
  }
