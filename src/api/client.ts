/**
 * Cliente de `GET /explanations/:id`.
 *
 * El backend vive en Render free: si estuvo inactivo, la primera petición lo
 * despierta y puede tardar cerca de un minuto (cold start). Mientras tanto
 * responde 502/503/504 o la conexión falla. Por eso se reintenta durante
 * `wakeBudgetMs` con esperas crecientes, avisando con `onWaking` para que la
 * página lo explique; si no despierta a tiempo, el resultado es `sleeping`.
 * 404 → `not_found`; 410, o un `expiresAt` ya pasado → `expired`.
 */

import type { ExplanationResult, PublishedExplanation } from './types';

const WAKING_STATUS = new Set([502, 503, 504]);

export interface FetchOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
  wakeBudgetMs?: number;
  onWaking?: () => void;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function isExpired(document: PublishedExplanation, now: number): boolean {
  return document.expiresAt !== null && Date.parse(document.expiresAt) <= now;
}

export async function fetchExplanation(id: string, options: FetchOptions): Promise<ExplanationResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? defaultSleep;
  const deadline = now() + (options.wakeBudgetMs ?? 90_000);
  const url = `${options.baseUrl.replace(/\/+$/, '')}/explanations/${encodeURIComponent(id)}`;
  let delay = 2_000;
  let warned = false;
  for (;;) {
    let response: Response | null = null;
    try {
      response = await fetchImpl(url, { signal: options.signal, headers: { Accept: 'application/json' } });
    } catch (error) {
      if (options.signal?.aborted) throw error;
    }
    if (response && !WAKING_STATUS.has(response.status)) return toResult(response, now());
    if (now() + delay > deadline) return { kind: 'sleeping' };
    if (!warned) {
      options.onWaking?.();
      warned = true;
    }
    await sleep(delay);
    delay = Math.min(delay * 2, 15_000);
  }
}

async function toResult(response: Response, now: number): Promise<ExplanationResult> {
  if (response.status === 404) return { kind: 'not_found' };
  if (response.status === 410) return { kind: 'expired', expiredAt: null };
  if (!response.ok) return { kind: 'error', message: `El servidor respondió ${response.status}.` };
  const document = (await response.json()) as PublishedExplanation;
  if (isExpired(document, now)) return { kind: 'expired', expiredAt: document.expiresAt };
  return { kind: 'ok', document };
}
