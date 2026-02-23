/**
 * API layer - uses gas-client when in GAS, mock data for local dev when GAS unavailable
 */
import { GASClient } from 'gas-client';
import type * as ServerTypes from '../../server';

const { serverFunctions } = new GASClient<typeof ServerTypes>({
  allowedDevelopmentDomains: (origin) =>
    /https:\/\/.*\.googleusercontent\.com$/.test(origin) ||
    /https:\/\/script\.google\.com$/.test(origin) ||
    /localhost/.test(origin) ||
    /127\.0\.0\.1/.test(origin),
});

export function isGasAvailable(): boolean {
  return typeof (window as { google?: { script?: { run?: unknown } } }).google?.script?.run !== 'undefined';
}

export { serverFunctions };
