/**
 * API layer — calls Google Apps Script server functions via gas-client.
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

export { serverFunctions };
