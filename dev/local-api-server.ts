/**
 * Local HTTP RPC for `yarn dev` — dispatches by name via `rpcHandlers` (no per-endpoint switch).
 */
/* eslint-disable import/no-extraneous-dependencies, no-console -- dev-only */
import 'dotenv/config';
import express from 'express';
import { isRpcHandlerName, rpcHandlers } from '../src/server/rpcHandlers';

const API_PORT = Number(process.env.MTV_LOCAL_API_PORT) || 3001;

type RpcBody = { function: string; args?: unknown[] };

const app = express();
app.use(express.json({ limit: '1mb' }));

app.post('/rpc', async (req, res) => {
  const body = req.body as RpcBody;
  const fn = body?.function;
  const args = Array.isArray(body?.args) ? body.args : [];

  if (!fn || !isRpcHandlerName(fn)) {
    res.status(400).json({ ok: false, error: `Unknown function: ${fn}` });
    return;
  }

  try {
    const handler = rpcHandlers[fn] as (...a: unknown[]) => unknown;
    const result = await Promise.resolve(handler(...args));
    res.json({ ok: true, result });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(200).json({ ok: false, error: message });
  }
});

app.listen(API_PORT, () => {
  console.log(`[mtv-local-api] http://127.0.0.1:${API_PORT} (POST /rpc)`);
});
