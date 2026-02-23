/**
 * External: Google Maps Distance Matrix API client.
 * Outbound HTTP calls from server to Google.
 */
import { CONFIG } from '../config';

function getApiKey(): string | null {
  const key = PropertiesService.getScriptProperties().getProperty(
    CONFIG.GOOGLE_MAPS_API_KEY_PROPERTY
  );
  if (!key) {
    Logger.log('ERROR: GOOGLE_MAPS_API_KEY not set in Script Properties');
  }
  return key;
}

export function calculateDistance(
  origin: string,
  destination: string
): number | { error: string } {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { error: 'API key not set in Script Properties' };
  }

  const base = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  const params = [
    'units=metric',
    'mode=driving',
    `origins=${encodeURIComponent(origin)}`,
    `destinations=${encodeURIComponent(destination)}`,
    `key=${encodeURIComponent(apiKey)}`,
  ].join('&');

  try {
    const resp = UrlFetchApp.fetch(`${base}?${params}`, {
      muteHttpExceptions: true,
    });
    const responseCode = resp.getResponseCode();
    const responseText = resp.getContentText();

    if (responseCode !== 200) {
      const errorMsg = `HTTP ${responseCode}: ${responseText.substring(0, 100)}`;
      Logger.log(
        `ERROR: Google API returned code ${responseCode}: ${responseText.substring(0, 200)}`
      );
      return { error: errorMsg };
    }

    const data = JSON.parse(responseText) as {
      status?: string;
      error_message?: string;
      rows?: { elements?: { status?: string; distance?: { value: number } }[] }[];
    };

    if (data.status && data.status !== 'OK') {
      const errorMsg = `${data.status}: ${data.error_message || 'Unknown error'}`;
      Logger.log(`ERROR: Google API status: ${data.status} - ${data.error_message || ''}`);
      Logger.log(`Origin: ${origin}, Destination: ${destination}`);
      return { error: errorMsg };
    }

    const row0 = data.rows && data.rows[0];
    const el0 = row0 && row0.elements && row0.elements[0];
    if (!el0) {
      const errorMsg = 'No element in response';
      Logger.log(`ERROR: ${errorMsg}. Rows: ${data.rows ? data.rows.length : 0}`);
      return { error: errorMsg };
    }
    if (el0.status !== 'OK') {
      const errorMsg = `Element status: ${el0.status}`;
      Logger.log(
        `ERROR: Distance Matrix element status: ${el0.status} for ${origin} -> ${destination}`
      );
      return { error: errorMsg };
    }
    return (el0.distance?.value ?? 0) / 1000.0;
  } catch (e) {
    const errorMsg = `Exception: ${(e as Error).toString()}`;
    Logger.log(
      `ERROR in calculateDistance: ${(e as Error).toString()} for ${origin} -> ${destination}`
    );
    return { error: errorMsg };
  }
}

export function testConnection(): { success: boolean; message: string } {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      success: false,
      message:
        'ERROR: API key not set. Go to Project Settings -> Script Properties and add GOOGLE_MAPS_API_KEY',
    };
  }

  Logger.log(
    `API Key found (length: ${apiKey.length}, starts with: ${apiKey.substring(0, 10)}...)`
  );

  const origin = 'Yishun, Singapore';
  const destination = 'Marina Bay, Singapore';

  const distResult = calculateDistance(origin, destination);

  if (distResult === null || (typeof distResult === 'object' && distResult.error)) {
    const errorMsg =
      typeof distResult === 'object' && distResult.error ? distResult.error : 'Unknown error';
    Logger.log(`ERROR: Distance calculation failed: ${errorMsg}`);
    return {
      success: false,
      message: `ERROR: Distance calculation failed: ${errorMsg}\n\nCheck View -> Logs in Apps Script editor for more details.`,
    };
  }

  const dist = typeof distResult === 'number' ? distResult : null;
  if (dist == null) {
    Logger.log('ERROR: Invalid distance result');
    return {
      success: false,
      message: 'ERROR: Invalid distance result',
    };
  }

  Logger.log(`SUCCESS: Distance from ${origin} to ${destination} = ${dist} km`);
  return {
    success: true,
    message: `SUCCESS: API key is working! Distance from ${origin} to ${destination} = ${dist.toFixed(2)} km`,
  };
}
