import { describe, expect, it, vi } from 'vitest';

import { fetchExplanation } from './client';
import type { PublishedExplanation } from './types';

const doc = (expiresAt: string | null): PublishedExplanation => ({
  id: 'abc',
  createdAt: '2026-10-25T00:00:00Z',
  expiresAt,
  explanation: {
    className: 'JsonObject',
    antipattern: 'god_class',
    antipatternName: 'Clase Dios (God Class)',
    principle: 'Principio de responsabilidad única (SRP)',
    evidence: { summary: '19 métodos y 1 atributos (umbral 15/10)', details: { methodCount: 19 } },
    metricsBefore: null,
    metricsAfter: null,
    narrative: null,
  },
});

const json = (status: number, body?: unknown) => new Response(body === undefined ? null : JSON.stringify(body), { status });

/** Reloj falso: `sleep` avanza el tiempo en vez de esperar. */
function fakeClock() {
  let t = Date.parse('2026-10-26T00:00:00Z');
  return { now: () => t, sleep: async (ms: number) => void (t += ms) };
}

describe('fetchExplanation', () => {
  it('devuelve el documento y pide la ruta /explanations/:id', async () => {
    const fetchImpl = vi.fn(async () => json(200, doc(null)));
    const result = await fetchExplanation('abc', { baseUrl: 'https://api.test/', fetchImpl, ...fakeClock() });
    expect(result).toEqual({ kind: 'ok', document: doc(null) });
    expect(fetchImpl).toHaveBeenCalledWith('https://api.test/explanations/abc', expect.anything());
  });

  it('404 es un documento inexistente y 410 uno vencido', async () => {
    const clock = fakeClock();
    expect(await fetchExplanation('x', { baseUrl: 'b', fetchImpl: async () => json(404), ...clock })).toEqual({ kind: 'not_found' });
    expect(await fetchExplanation('x', { baseUrl: 'b', fetchImpl: async () => json(410), ...clock })).toEqual({
      kind: 'expired',
      expiredAt: null,
    });
  });

  it('un expiresAt ya pasado también es un documento vencido', async () => {
    const result = await fetchExplanation('abc', {
      baseUrl: 'b',
      fetchImpl: async () => json(200, doc('2026-10-01T00:00:00Z')),
      ...fakeClock(),
    });
    expect(result).toEqual({ kind: 'expired', expiredAt: '2026-10-01T00:00:00Z' });
  });

  it('reintenta mientras el backend despierta (503 y conexión caída) y avisa una sola vez', async () => {
    const answers = [() => json(503), () => Promise.reject(new TypeError('Failed to fetch')), () => json(200, doc(null))];
    const fetchImpl = vi.fn(async () => answers.shift()!());
    const onWaking = vi.fn();
    const result = await fetchExplanation('abc', { baseUrl: 'b', fetchImpl, onWaking, ...fakeClock() });
    expect(result.kind).toBe('ok');
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(onWaking).toHaveBeenCalledTimes(1);
  });

  it('si no despierta dentro del presupuesto, el backend está dormido', async () => {
    const fetchImpl = vi.fn(async () => json(502));
    const result = await fetchExplanation('abc', { baseUrl: 'b', fetchImpl, wakeBudgetMs: 30_000, ...fakeClock() });
    expect(result).toEqual({ kind: 'sleeping' });
    expect(fetchImpl.mock.calls.length).toBeGreaterThan(2);
  });

  it('otro error del servidor se informa sin reintentar', async () => {
    const fetchImpl = vi.fn(async () => json(500));
    expect(await fetchExplanation('abc', { baseUrl: 'b', fetchImpl, ...fakeClock() })).toEqual({
      kind: 'error',
      message: 'El servidor respondió 500.',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
