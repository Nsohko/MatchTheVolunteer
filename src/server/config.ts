// ============================================================================
// CONFIGURATION - read from GAS Script Properties
// ============================================================================
// Set these in: Project Settings → Script properties (script.google.com)
// For local dev, use .env (see .env.example)
// ============================================================================

const props =
  typeof PropertiesService !== 'undefined'
    ? PropertiesService.getScriptProperties()
    : {
        getProperty: (key: string) => process.env[key] ?? null,
      };

export const CONFIG = {
  VOLUNTEER_SHEET_URL: props.getProperty('VOLUNTEER_SHEET_URL') ?? '',
  CASE_SHEET_URL: props.getProperty('CASE_SHEET_URL') ?? '',
  VOLUNTEER_SHEET_NAME: props.getProperty('VOLUNTEER_SHEET_NAME') ?? 'Volunteer Masterlist',
  CASE_SHEET_NAME: props.getProperty('CASE_SHEET_NAME') ?? 'Cases',
  GOOGLE_MAPS_API_KEY_PROPERTY: 'GOOGLE_MAPS_API_KEY',
};
