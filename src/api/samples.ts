/**
 * Documentos de ejemplo, para cuando no hay backend configurado.
 *
 * La parte determinista de `ejemplo` (evidencia y métricas) es la respuesta
 * real de `POST /analyze/explain` para `JsonObject` de Gson. La narrativa está
 * escrita a mano para mostrar el formato: la página lo avisa con
 * `SAMPLE_NOTICE`. Los otros ids muestran cada estado de la página sin
 * backend: `ejemplo-sin-ia` (la IA no escribió la narrativa),
 * `ejemplo-vencido` y `ejemplo-dormido` (el backend no despierta a tiempo).
 */

import type { ExplanationResult, PublishedExplanation, RefactorExplanation } from './types';

export const SAMPLE_NOTICE =
  'Documento de ejemplo: la evidencia y las métricas son las reales de JsonObject (Gson); la narrativa está escrita a mano para mostrar el formato.';

const jsonObject: RefactorExplanation = {
  className: 'JsonObject',
  antipattern: 'god_class',
  antipatternName: 'Clase Dios (God Class)',
  principle: 'Principio de responsabilidad única (SRP)',
  evidence: {
    summary: '19 métodos y 1 atributos (umbral 15/10)',
    details: { className: 'JsonObject', methodCount: 19, attributeCount: 1, methodThreshold: 15, attributeThreshold: 10 },
  },
  metricsBefore: { methodCount: 19, attributeCount: 1 },
  metricsAfter: { methodCount: 12, attributeCount: 1 },
  narrative: {
    whyItBreaks:
      'JsonObject declara 19 métodos contra un umbral de 15: además de guardar los miembros, convierte cada valor primitivo (las cuatro sobrecargas de addProperty) y ofrece accesos tipados (getAsJsonPrimitive, getAsJsonArray, getAsJsonObject).',
    concreteProblem:
      'Un tipo primitivo nuevo obliga a sumar otra sobrecarga de addProperty en la misma clase, y cada cambio en la conversión o en los accesos tipados toca el contenedor que usa todo Gson.',
    chosenSolution:
      'Extraer JsonObjectTypedAccess (los tres accesos tipados) y JsonObjectPropertyWriter (las sobrecargas de addProperty). JsonObject queda con el mapa de miembros y su API básica.',
    whyThisSolution:
      'Separa las dos responsabilidades que más crecen sin cambiar cómo se guardan los miembros, y baja la clase de 19 a 12 métodos, por debajo del umbral.',
    alternatives: [
      { option: 'Dejar la clase como está', whyDiscarded: 'Sigue creciendo con cada tipo nuevo y queda por encima del umbral.' },
      { option: 'Mover la conversión a JsonPrimitive', whyDiscarded: 'Mezcla la responsabilidad en otra clase pública en vez de separarla.' },
    ],
    risks: [
      'Es API pública de Gson: hay que conservar los métodos en JsonObject como delegados para no romper a los usuarios.',
      'Los accesos tipados lanzan ClassCastException; el comportamiento debe quedar idéntico.',
    ],
  },
};

const published = (id: string, explanation: RefactorExplanation, expiresAt: string | null): PublishedExplanation => ({
  id,
  createdAt: '2026-10-25T23:40:54Z',
  expiresAt,
  explanation,
});

const SAMPLES: Record<string, PublishedExplanation> = {
  ejemplo: published('ejemplo', jsonObject, null),
  'ejemplo-sin-ia': published('ejemplo-sin-ia', { ...jsonObject, narrative: null }, null),
  'ejemplo-vencido': published('ejemplo-vencido', jsonObject, '2026-10-01T12:00:00Z'),
};

export const SAMPLE_IDS = [...Object.keys(SAMPLES), 'ejemplo-dormido'];

export interface SampleOptions {
  onWaking?: () => void;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function loadSample(id: string, options: SampleOptions = {}): Promise<ExplanationResult> {
  const sleep = options.sleep ?? wait;
  const now = options.now ?? Date.now;
  await sleep(700);
  if (id === 'ejemplo-dormido') {
    options.onWaking?.();
    await sleep(4_000);
    return { kind: 'sleeping' };
  }
  const document = SAMPLES[id];
  if (!document) return { kind: 'not_found' };
  if (document.expiresAt !== null && Date.parse(document.expiresAt) <= now()) {
    return { kind: 'expired', expiredAt: document.expiresAt };
  }
  return { kind: 'ok', document };
}
