/**
 * Métricas antes y después: métodos, atributos y complejidad ciclomática total. Cada fila aparece solo
 * si tiene los dos valores; el cambio se marca en verde cuando baja (menos es mejor en las tres).
 */

import type { RefactorExplanation } from '../api/types';

type Row = [label: string, before: number, after: number];

export function metricRows(e: RefactorExplanation): Row[] {
  const rows: Row[] = [];
  if (e.metricsBefore && e.metricsAfter) {
    rows.push(['Métodos', e.metricsBefore.methodCount, e.metricsAfter.methodCount]);
    rows.push(['Atributos', e.metricsBefore.attributeCount, e.metricsAfter.attributeCount]);
  }
  if (typeof e.complexityBefore === 'number' && typeof e.complexityAfter === 'number') {
    rows.push(['Complejidad ciclomática', e.complexityBefore, e.complexityAfter]);
  }
  return rows;
}

export function MetricsComparison({ explanation }: { explanation: RefactorExplanation }) {
  const rows = metricRows(explanation);
  if (rows.length === 0) return null;
  return (
    <div className="table-scroll">
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
          {rows.map(([label, before, after]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{before}</td>
              <td>{after}</td>
              <td className={after < before ? 'delta delta--down' : 'delta'}>
                {after - before > 0 ? `+${after - before}` : after - before}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
