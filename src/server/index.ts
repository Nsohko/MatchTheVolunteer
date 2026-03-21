
import { getCasesList } from "./handlers/case";
import {
  getClosestVolunteersForCase,
  getVolunteersList,
  searchVolunteerByCode,
} from "./handlers/volunteer";


/**
 * Web app entry point - serves the React UI
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('match-the-volunteer');
}

export {
  doGet,
  searchVolunteerByCode,
  getVolunteersList,
  getCasesList,
  getClosestVolunteersForCase
};
