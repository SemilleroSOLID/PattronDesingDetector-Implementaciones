/**
 * Las pantallas de estado de un documento: cargando, backend despertando,
 * vencido, inexistente, backend dormido y error. Cada una dice qué pasa y,
 * cuando tiene sentido, ofrece reintentar.
 */

import type { ReactNode } from 'react';

import type { ExplanationState } from '../hooks/useExplanation';

interface Props {
  state: Exclude<ExplanationState, { kind: 'ok' }>;
  onRetry: () => void;
}

function Panel({ tone, title, children }: { tone: string; title: string; children: ReactNode }) {
  return (
    <section className={`status status--${tone}`} role="status" aria-live="polite">
      <h1>{title}</h1>
      {children}
    </section>
  );
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

export function StatusView({ state, onRetry }: Props) {
  const retry = (
    <button type="button" className="button" onClick={onRetry}>
      Reintentar
    </button>
  );
  switch (state.kind) {
    case 'loading':
      return (
        <Panel tone="info" title="Cargando el documento…">
          <div className="spinner" aria-hidden="true" />
        </Panel>
      );
    case 'waking':
      return (
        <Panel tone="info" title="Despertando el servidor…">
          <div className="spinner" aria-hidden="true" />
          <p>El backend estaba inactivo y está arrancando. La primera carga puede tardar hasta un minuto.</p>
        </Panel>
      );
    case 'expired':
      return (
        <Panel tone="warning" title="Este documento venció">
          <p>
            {state.expiredAt ? `Estuvo disponible hasta el ${formatDate(state.expiredAt)}. ` : ''}
            Vuelve a generar la explicación desde la extensión con «Ver implementación».
          </p>
        </Panel>
      );
    case 'not_found':
      return (
        <Panel tone="warning" title="Este documento no existe o ya venció">
          <p>
            El link no corresponde a ninguna explicación vigente: puede haber vencido (duran 30 días) o estar incompleto.
            Vuelve a generarla desde la extensión con «Ver implementación».
          </p>
        </Panel>
      );
    case 'sleeping':
      return (
        <Panel tone="error" title="El servidor no respondió a tiempo">
          <p>El backend sigue dormido o está saturado. Espera unos segundos y vuelve a intentarlo.</p>
          {retry}
        </Panel>
      );
    case 'error':
      return (
        <Panel tone="error" title="No se pudo cargar el documento">
          <p>{state.message}</p>
          {retry}
        </Panel>
      );
  }
}
