/**
 * Portada: qué es esta página y, mientras no hay backend, los documentos de
 * ejemplo (uno por estado) para verla funcionar.
 */

import { Link } from 'react-router-dom';

import { usingSamples } from '../api/source';
import { SAMPLE_IDS } from '../api/samples';

const LABELS: Record<string, string> = {
  ejemplo: 'Documento completo (God Class en JsonObject de Gson)',
  'ejemplo-sin-ia': 'Sin la explicación de la IA (solo evidencia y métricas)',
  'ejemplo-vencido': 'Documento vencido',
  'ejemplo-dormido': 'Backend dormido (no despierta a tiempo)',
};

export function HomePage() {
  return (
    <section className="home">
      <h1>Ver implementación</h1>
      <p>
        Cada documento explica un refactor detectado por Pattern Detector: qué principio se rompía, por qué se eligió esa
        solución y qué cambia. Se abre desde la extensión de VS Code con el link «Ver implementación».
      </p>
      {usingSamples() && (
        <>
          <h2>Documentos de ejemplo</h2>
          <ul>
            {SAMPLE_IDS.map((id) => (
              <li key={id}>
                <Link to={`/implementacion/${id}`}>{LABELS[id] ?? id}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
