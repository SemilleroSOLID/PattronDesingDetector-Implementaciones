/**
 * El documento técnico, en secciones desplegables: qué se incumplía (principio, evidencia y umbral),
 * por qué esta solución, alternativas descartadas, riesgos al aplicarla y antes y después (métricas y
 * código). Arranca con la primera abierta; la barra expande o contrae todo y manda a imprimir (o a PDF
 * desde el diálogo de impresión del navegador), que despliega todas. Sin la narrativa de la IA, las
 * secciones que dependen de ella lo avisan y la evidencia y las métricas se muestran igual.
 */

import type { ReactNode } from 'react';

import type { PublishedExplanation } from '../api/types';
import { useSections } from '../hooks/useSections';
import { CodeComparison } from './CodeComparison';
import { MetricsComparison, metricRows } from './MetricsComparison';
import { QaBadge } from './QaBadge';
import { Section } from './Section';

export const SECTIONS = [
  { id: 'incumplia', title: 'Qué se incumplía' },
  { id: 'solucion', title: 'Por qué esta solución' },
  { id: 'alternativas', title: 'Alternativas descartadas' },
  { id: 'riesgos', title: 'Riesgos al aplicarla' },
  { id: 'antes-despues', title: 'Antes y después' },
] as const;

const SECTION_IDS = SECTIONS.map((s) => s.id);
const NO_AI = 'La IA no escribió esta parte del documento. La evidencia y las métricas son las que midió el detector.';

interface Props {
  document: PublishedExplanation;
  notice?: string;
}

function EvidenceDetails({ details }: { details: Record<string, unknown> }) {
  return (
    <dl className="details">
      {Object.entries(details).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Toolbar({ onExpand, onCollapse }: { onExpand: () => void; onCollapse: () => void }) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Acciones del documento">
      <button type="button" className="button button--ghost" onClick={onExpand}>
        Expandir todo
      </button>
      <button type="button" className="button button--ghost" onClick={onCollapse}>
        Contraer todo
      </button>
      <button type="button" className="button" onClick={() => window.print()}>
        Imprimir o PDF
      </button>
    </div>
  );
}

export function ExplanationDocument({ document, notice }: Props) {
  const { explanation: e } = document;
  const n = e.narrative;
  const sections = useSections(SECTION_IDS, ['incumplia']);
  const body: Record<(typeof SECTION_IDS)[number], ReactNode> = {
    incumplia: (
      <>
        <p>
          <strong>{e.principle}</strong> · {e.antipatternName}
        </p>
        <p className="evidence">{e.evidence.summary}</p>
        {n && <p>{n.whyItBreaks}</p>}
        <EvidenceDetails details={e.evidence.details} />
      </>
    ),
    solucion: n ? (
      <>
        <h3>El problema en esta clase</h3>
        <p>{n.concreteProblem}</p>
        <h3>La solución elegida</h3>
        <p>{n.chosenSolution}</p>
        <p>{n.whyThisSolution}</p>
      </>
    ) : (
      <p className="muted">{NO_AI}</p>
    ),
    alternativas: n?.alternatives.length ? (
      <ul>
        {n.alternatives.map((alt) => (
          <li key={alt.option}>
            <strong>{alt.option}:</strong> {alt.whyDiscarded}
          </li>
        ))}
      </ul>
    ) : (
      <p className="muted">{n ? 'No se descartaron alternativas.' : NO_AI}</p>
    ),
    riesgos: n?.risks.length ? (
      <ul>
        {n.risks.map((risk) => (
          <li key={risk}>{risk}</li>
        ))}
      </ul>
    ) : (
      <p className="muted">{n ? 'No se señalaron riesgos.' : NO_AI}</p>
    ),
    'antes-despues': (
      <>
        <MetricsComparison explanation={e} />
        {e.code && (e.code.before.length > 0 || e.code.after.length > 0) ? (
          <CodeComparison code={e.code} />
        ) : (
          metricRows(e).length === 0 && <p className="muted">Este documento no trae código ni métricas antes y después.</p>
        )}
      </>
    ),
  };

  return (
    <article className="document">
      {notice && <p className="notice">{notice}</p>}
      <header className="document__header">
        <p className="eyebrow">{e.principle}</p>
        <h1>
          {e.antipatternName} en <code>{e.className}</code>
        </h1>
        <QaBadge status={e.verificationStatus} />
        <Toolbar onExpand={sections.expandAll} onCollapse={sections.collapseAll} />
      </header>
      {SECTIONS.map(({ id, title }) => (
        <Section key={id} id={id} title={title} open={sections.isOpen(id)} onToggle={sections.toggle}>
          {body[id]}
        </Section>
      ))}
    </article>
  );
}
