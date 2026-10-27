/**
 * Estado del QA de la sugerencia: si otro modelo la revisó y la aprobó. Un documento anterior a este
 * dato no muestra nada (no se inventa un estado).
 */

import type { RefactorExplanation } from '../api/types';

export function QaBadge({ status }: { status: RefactorExplanation['verificationStatus'] }) {
  if (status === 'verified') {
    return <span className="badge badge--ok">✓ Verificada por el QA</span>;
  }
  if (status === 'unverified') {
    return (
      <span className="badge badge--warn" title="El QA no la aprobó o no llegó a revisarla">
        Sin verificar por el QA
      </span>
    );
  }
  return null;
}
