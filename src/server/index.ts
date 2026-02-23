
import { getCasesList } from "./handlers/case";
import { getClosestVolunteersForCase, searchVolunteerByCode } from "./handlers/volunteer";


/**
 * Web app entry point - serves the React UI
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('match-the-volunteer');
}

export {
  doGet,
  searchVolunteerByCode,
  getCasesList,
  getClosestVolunteersForCase,
};
