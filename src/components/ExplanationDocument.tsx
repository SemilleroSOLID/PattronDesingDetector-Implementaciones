/**
 * El documento técnico: qué principio se rompía (con la evidencia real del
 * detector), qué cambia (métricas antes/después) y la explicación de la IA.
 * Si la IA no la escribió, se muestra igual la parte determinista con un aviso.
 */

import type { ClassMetrics, PublishedExplanation } from '../api/types';

interface Props {
  document: PublishedExplanation;
  notice?: string;
}

function MetricsTable({ before, after }: { before: ClassMetrics; after: ClassMetrics }) {
  const rows: [string, number, number][] = [
    ['Métodos', before.methodCount, after.methodCount],
    ['Atributos', before.attributeCount, after.attributeCount],
  ];
  return (
    <table className="metrics">
      <thead>
        <tr>
          <th scope="col">Métrica</th>
          <th scope="col">Antes</th>
          <th scope="col">Después</th>
          <th scope="col">Cambio</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, a, b]) => (
          <tr key={name}>
            <th scope="row">{name}</th>
            <td>{a}</td>
            <td>{b}</td>
            <td className={b < a ? 'delta delta--down' : 'delta'}>{b - a > 0 ? `+${b - a}` : b - a}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
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

export function ExplanationDocument({ document, notice }: Props) {
  const { explanation: e } = document;
  const n = e.narrative;
  return (
    <article className="document">
      {notice && <p className="notice">{notice}</p>}
      <header>
        <p className="eyebrow">{e.principle}</p>
        <h1>
          {e.antipatternName} en <code>{e.className}</code>
        </h1>
      </header>

      <section>
        <h2>Qué se rompía</h2>
        <p className="evidence">{e.evidence.summary}</p>
        {n && <p>{n.whyItBreaks}</p>}
        <EvidenceDetails details={e.evidence.details} />
      </section>

      {n ? (
        <>
          <section>
            <h2>Qué problema causa</h2>
            <p>{n.concreteProblem}</p>
          </section>
          <section>
            <h2>La solución elegida</h2>
            <p>{n.chosenSolution}</p>
            <p>{n.whyThisSolution}</p>
          </section>
          {n.alternatives.length > 0 && (
            <section>
              <h2>Alternativas descartadas</h2>
              <ul>
                {n.alternatives.map((alt) => (
                  <li key={alt.option}>
                    <strong>{alt.option}:</strong> {alt.whyDiscarded}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {n.risks.length > 0 && (
            <section>
              <h2>Riesgos al aplicarlo</h2>
              <ul>
                {n.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <p className="notice notice--muted">
          La explicación de la IA no está disponible para este documento. La evidencia y las métricas son las que midió el
          detector.
        </p>
      )}

      {e.metricsBefore && e.metricsAfter && (
        <section>
          <h2>Qué cambia</h2>
          <MetricsTable before={e.metricsBefore} after={e.metricsAfter} />
        </section>
      )}
    </article>
  );
}
