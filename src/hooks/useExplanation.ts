/**
 * Estado de la página de un documento: `loading` mientras llega, `waking` si
 * el backend está despertando (cold start de Render), y después el resultado.
 * `retry` vuelve a pedirlo (para "backend dormido" o un error). Una petición
 * vieja que llega tarde no pisa a la nueva: se aborta al cambiar de id o al
 * desmontar.
 */

import { useCallback, useEffect, useState } from 'react';

import type { ExplanationResult } from '../api/types';

export type ExplanationState = { kind: 'loading' } | { kind: 'waking' } | ExplanationResult;

type Loader = (id: string, signal: AbortSignal, onWaking: () => void) => Promise<ExplanationResult>;

export function useExplanation(id: string, load: Loader): { state: ExplanationState; retry: () => void } {
  const [state, setState] = useState<ExplanationState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: 'loading' });
    load(id, controller.signal, () => {
      if (!controller.signal.aborted) setState({ kind: 'waking' });
    })
      .then((result) => {
        if (!controller.signal.aborted) setState(result);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ kind: 'error', message: error instanceof Error ? error.message : String(error) });
        }
      });
    return () => controller.abort();
  }, [id, load, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}
