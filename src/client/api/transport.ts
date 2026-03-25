/**
 * Single entry for calling server logic: GAS when hosted on Google, HTTP RPC when on Vite + local API.
 */
import { GASClient } from 'gas-client';
import type * as ServerTypes from '../../server';
import type { RpcHandlerName } from '../../server/rpcHandlers';

function gasAllowedOrigins(origin: string): boolean {
  return (
    /https:\/\/.*\.googleusercontent\.com$/.test(origin) ||
    /https:\/\/script\.google\.com$/.test(origin) ||
    /localhost/.test(origin) ||
    /127\.0\.0\.1/.test(origin)
  );
}

export function isGasAvailable(): boolean {
  return (
    typeof (window as { google?: { script?: { run?: unknown } } }).google
      ?.script?.run !== 'undefined'
  );
}

let gasClient: GASClient<typeof ServerTypes> | null = null;

function getGasClient(): GASClient<typeof ServerTypes> {
  if (!gasClient) {
    gasClient = new GASClient<typeof ServerTypes>({
      allowedDevelopmentDomains: gasAllowedOrigins,
    });
  }
  return gasClient;
}

async function localRpc<T>(name: RpcHandlerName, args: unknown[]): Promise<T> {
  const res = await fetch('/api/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ function: name, args }),
  });
  const data = (await res.json()) as {
    ok: boolean;
    result?: T;
    error?: string;
  };
  if (!data.ok) {
    throw new Error(data.error || 'Local API request failed');
  }
  return data.result as T;
}

/** Unwrap gas-client Promise + possible async server function Promise. */
async function unwrapServerResult<T>(out: unknown): Promise<T> {
  let v = await Promise.resolve(out);
  if (v instanceof Promise) {
    v = await v;
  }
  return v as T;
}

/**
 * Call a server function by name with a JSON-serializable argument list
 * (must match the handler signature order).
 */
export async function invokeRpc<T>(
  name: RpcHandlerName,
  args: unknown[]
): Promise<T> {
  if (isGasAvailable()) {
    const fns = getGasClient().serverFunctions as unknown as Record<
      RpcHandlerName,
      (...a: unknown[]) => unknown
    >;
    const fn = fns[name];
    if (typeof fn !== 'function') {
      throw new Error(`Unknown GAS function: ${String(name)}`);
    }
    return unwrapServerResult<T>(fn(...args));
  }
  return localRpc<T>(name, args);
}
