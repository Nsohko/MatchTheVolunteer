import { CONFIG } from './config';
import { Volunteer } from './models';
import { Case } from './models';

// ============================================================================
// SERVICE CLASSES
// ============================================================================

/**
 * Service for Google Maps Distance Matrix API
 */
export class DistanceService {
  apiKey: string | null;

  constructor() {
    this.apiKey = PropertiesService.getScriptProperties().getProperty(
      CONFIG.GOOGLE_MAPS_API_KEY_PROPERTY
    );

    if (!this.apiKey) {
      Logger.log('ERROR: GOOGLE_MAPS_API_KEY not set in Script Properties');
    }
  }

  calculateDistance(origin: string, destination: string): number | { error: string } {
    if (!this.apiKey) {
      return { error: 'API key not set in Script Properties' };
    }

    const base = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const params = [
      'units=metric',
      'mode=driving',
      `origins=${encodeURIComponent(origin)}`,
      `destinations=${encodeURIComponent(destination)}`,
      `key=${encodeURIComponent(this.apiKey)}`,
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

  testConnection(): { success: boolean; message: string } {
    if (!this.apiKey) {
      return {
        success: false,
        message:
          'ERROR: API key not set. Go to Project Settings -> Script Properties and add GOOGLE_MAPS_API_KEY',
      };
    }

    Logger.log(
      `API Key found (length: ${this.apiKey.length}, starts with: ${this.apiKey.substring(0, 10)}...)`
    );

    const origin = 'Yishun, Singapore';
    const destination = 'Marina Bay, Singapore';

    const distResult = this.calculateDistance(origin, destination);

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
}

/**
 * Service for volunteer matching logic
 */
export class VolunteerMatchingService {
  distanceService: DistanceService;

  constructor() {
    this.distanceService = new DistanceService();
  }

  findClosestVolunteers(
    caseObj: Case,
    volunteers: Volunteer[],
    k = 5
  ): {
    volunteers: { code: string; distanceKm: number; location: string }[];
    debug: {
      volunteersChecked: number;
      volunteersWithLocation: number;
      volunteersWithDistance: number;
      apiErrors?: number;
      firstError?: string;
      apiErrorDetails?: string;
    };
  } {
    const caseLocation = caseObj.location;
    const candidates: { code: string; distanceKm: number; location: string }[] = [];
    const debug: {
      volunteersChecked: number;
      volunteersWithLocation: number;
      volunteersWithDistance: number;
      apiErrors: number;
      firstError?: string;
      apiErrorDetails?: string;
    } = {
      volunteersChecked: 0,
      volunteersWithLocation: 0,
      volunteersWithDistance: 0,
      apiErrors: 0,
    };

    for (const volunteer of volunteers) {
      debug.volunteersChecked++;

      const volLocation = volunteer.location;
      if (!volLocation) continue;

      debug.volunteersWithLocation++;

      const distResult = this.distanceService.calculateDistance(caseLocation, volLocation);

      if (distResult === null || (typeof distResult === 'object' && distResult.error)) {
        debug.apiErrors++;
        if (debug.firstError === undefined) {
          debug.firstError = `${caseLocation} -> ${volLocation}`;
          debug.apiErrorDetails =
            typeof distResult === 'object' && distResult.error
              ? distResult.error
              : 'API returned null';
        }
        continue;
      }

      const dist = typeof distResult === 'number' ? distResult : null;
      if (dist == null || Number.isNaN(dist)) {
        debug.apiErrors++;
        if (debug.firstError === undefined) {
          debug.firstError = `${caseLocation} -> ${volLocation}`;
          debug.apiErrorDetails = 'Invalid distance result';
        }
        continue;
      }

      debug.volunteersWithDistance++;
      candidates.push({
        code: volunteer.code,
        distanceKm: dist,
        location: volLocation,
      });
    }

    candidates.sort((a, b) => a.distanceKm - b.distanceKm);
    const topVolunteers = candidates.slice(0, k);

    return {
      volunteers: topVolunteers,
      debug,
    };
  }
}
