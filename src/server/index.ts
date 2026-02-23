import {
  searchVolunteerByCode,
  getCasesList,
  getClosestVolunteersForCase,
  testGoogleMapsAPI,
} from './api';

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
  testGoogleMapsAPI,
};
