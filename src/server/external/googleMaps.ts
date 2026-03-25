/**
 * External: Google Maps Distance Matrix API client.
 * Outbound HTTP calls from server to Google.
 */
import { MatrixJson } from '../../types/external';
import { CONFIG, getScriptProperty } from '../config';
import { safeLog } from '../utils/misc';

function getApiKey(): string | null {
  const key = getScriptProperty(CONFIG.GOOGLE_MAPS_API_KEY_PROPERTY);
  if (!key && typeof PropertiesService !== 'undefined') {
    safeLog('ERROR: GOOGLE_MAPS_API_KEY not set in Script Properties');
  }
  return key;
}

function buildDistanceMatrixUrl(
  origin: string,
  destination: string,
  apiKey: string
): string {
  const base = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  const params = [
    'units=metric',
    'mode=driving',
    `origins=${encodeURIComponent(origin)}`,
    `destinations=${encodeURIComponent(destination)}`,
    `key=${encodeURIComponent(apiKey)}`,
  ].join('&');
  return `${base}?${params}`;
}

function parseDistanceMatrixResponse(
  responseText: string,
  origin: string,
  destination: string
): number | { error: string } {
  let data: MatrixJson;
  try {
    data = JSON.parse(responseText) as MatrixJson;
  } catch {
    return { error: 'Invalid JSON from Distance Matrix API' };
  }

  if (data.status && data.status !== 'OK') {
    const errorMsg = `${data.status}: ${data.error_message || 'Unknown error'}`;
    safeLog(
      `ERROR: Google API status: ${data.status} - ${data.error_message || ''}`
    );
    safeLog(`Origin: ${origin}, Destination: ${destination}`);
    return { error: errorMsg };
  }

  const row0 = data.rows && data.rows[0];
  const el0 = row0 && row0.elements && row0.elements[0];
  if (!el0) {
    const errorMsg = 'No element in response';
    safeLog(`ERROR: ${errorMsg}. Rows: ${data.rows ? data.rows.length : 0}`);
    return { error: errorMsg };
  }
  if (el0.status !== 'OK') {
    const errorMsg = `Element status: ${el0.status}`;
    safeLog(
      `ERROR: Distance Matrix element status: ${el0.status} for ${origin} -> ${destination}`
    );
    return { error: errorMsg };
  }
  return (el0.distance?.value ?? 0) / 1000.0;
}

function getResponseGas(url: string): [number, string] {
  const resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
  });
  return [resp.getResponseCode(), resp.getContentText()];
}

async function getResponseFetch(url: string): Promise<[number, string]> {
  const resp = await fetch(url);
  const text = await resp.text();
  return [resp.status, text];
}

function distanceFromHttpResult(
  responseCode: number,
  responseText: string,
  origin: string,
  destination: string
): number | { error: string } {
  if (responseCode !== 200) {
    const errorMsg = `HTTP ${responseCode}: ${responseText.substring(
      0,
      100
    )}`;
    safeLog(
      `ERROR: Google API returned code ${responseCode}: ${responseText.substring(
        0,
        200
      )}`
    );
    return { error: errorMsg };
  }
  return parseDistanceMatrixResponse(responseText, origin, destination);
}

export function calculateDistance(
  origin: string,
  destination: string
): number | { error: string } {
  if (typeof UrlFetchApp === 'undefined') {
    return { error: 'calculateDistance is only for Apps Script' };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return { error: 'API key not set in Script Properties' };
  }

  const url = buildDistanceMatrixUrl(origin, destination, apiKey);

  try {
    const [responseCode, responseText] = getResponseGas(url);
    return distanceFromHttpResult(responseCode, responseText, origin, destination);
  } catch (e) {
    const errorMsg = `Exception: ${(e as Error).toString()}`;
    safeLog(
      `ERROR in calculateDistance: ${(
        e as Error
      ).toString()} for ${origin} -> ${destination}`
    );
    return { error: errorMsg };
  }
}

/** Node / local — same contract as {@link calculateDistance} using global `fetch`. */
export async function calculateDistanceAsync(
  origin: string,
  destination: string
): Promise<number | { error: string }> {

  const apiKey = getApiKey();
  if (!apiKey) {
    return { error: 'API key not set (GOOGLE_MAPS_API_KEY)' };
  }

  const url = buildDistanceMatrixUrl(origin, destination, apiKey);

  try {
    const [responseCode, responseText] = await getResponseFetch(url);
    return distanceFromHttpResult(responseCode, responseText, origin, destination);
  } catch (e) {
    const errorMsg = `Exception: ${(e as Error).toString()}`;
    safeLog(
      `ERROR in calculateDistanceAsync: ${(
        e as Error
      ).toString()} for ${origin} -> ${destination}`
    );
    return { error: errorMsg };
  }
}
