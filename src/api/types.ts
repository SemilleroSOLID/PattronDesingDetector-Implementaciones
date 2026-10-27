/**
 * Contrato del documento técnico.
 *
 * `RefactorExplanation` replica el esquema del backend (POST /analyze/explain,
 * `docs/openapi.yaml` de pattern-design-detector-backend). `PublishedExplanation`
 * es lo que devuelve `GET /explanations/:id`: la explicación guardada, con su id
 * y su vencimiento. Ese endpoint lo agrega el backend en "Publicar la
 * explicación"; hasta entonces la app usa los documentos de `samples.ts`.
 */

export interface ClassMetrics {
  methodCount: number;
  attributeCount: number;
}

export interface ExplanationEvidence {
  /** Frase del detector con los números y umbrales, por ejemplo "19 métodos y 1 atributos (umbral 15/10)". */
  summary: string;
  /** El hallazgo completo del detector, sin la sugerencia. */
  details: Record<string, unknown>;
}

export interface ExplanationAlternative {
  option: string;
  whyDiscarded: string;
}

export interface ExplanationNarrative {
  whyItBreaks: string;
  concreteProblem: string;
  chosenSolution: string;
  whyThisSolution: string;
  alternatives: ExplanationAlternative[];
  risks: string[];
}

export interface RefactorExplanation {
  className: string;
  antipattern: string;
  antipatternName: string;
  principle: string;
  evidence: ExplanationEvidence;
  metricsBefore: ClassMetrics | null;
  metricsAfter: ClassMetrics | null;
  /** null si la IA no pudo escribir la narrativa: la parte determinista llega igual. */
  narrative: ExplanationNarrative | null;
}

export interface PublishedExplanation {
  id: string;
  /** Fecha ISO 8601 de publicación. */
  createdAt: string;
  /** Fecha ISO 8601 de vencimiento; null si no vence. */
  expiresAt: string | null;
  explanation: RefactorExplanation;
}

/** Resultado de pedir un documento: o el documento, o por qué no se puede mostrar. */
export type ExplanationResult =
  | { kind: 'ok'; document: PublishedExplanation }
  | { kind: 'not_found' }
  | { kind: 'expired'; expiredAt: string | null }
  | { kind: 'sleeping' }
  | { kind: 'error'; message: string };
