/**
 * De dónde sale un documento: el backend si `VITE_API_BASE_URL` está
 * configurada, o los ejemplos de `samples.ts` si no (mientras
 * `GET /explanations/:id` no exista). Las páginas solo llaman a
 * `loadExplanation` y no saben cuál de los dos se usa.
 */

import { fetchExplanation } from './client';
import { loadSample } from './samples';
import type { ExplanationResult } from './types';

export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? '').trim();

export const usingSamples = (): boolean => API_BASE_URL === '';

export function loadExplanation(id: string, signal: AbortSignal, onWaking: () => void): Promise<ExplanationResult> {
  if (usingSamples()) return loadSample(id, { onWaking });
  return fetchExplanation(id, { baseUrl: API_BASE_URL, signal, onWaking });
}
