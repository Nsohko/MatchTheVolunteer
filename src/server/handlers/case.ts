import { CaseRepository } from "../repository/CaseRepository";
import { Case } from "../../types/case";

export function getCasesList(): Case[] {
  try {
    const repository = new CaseRepository();
    return repository.getAllCases()
  } catch (error) {
    throw new Error(`Error getting cases: ${(error as Error).toString()}`);
  }
}
