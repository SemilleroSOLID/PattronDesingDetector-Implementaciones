/**
 * Ruta `/#/implementacion/:id`: pide el documento y muestra su estado o el
 * documento. El cargador se inyecta para probar la página sin red.
 */

import { useParams } from 'react-router-dom';

import { usingSamples, loadExplanation } from '../api/source';
import { SAMPLE_NOTICE } from '../api/samples';
import { ExplanationDocument } from '../components/ExplanationDocument';
import { StatusView } from '../components/StatusView';
import { useExplanation } from '../hooks/useExplanation';

interface Props {
  load?: typeof loadExplanation;
  sampleMode?: boolean;
}

export function DocumentPage({ load = loadExplanation, sampleMode = usingSamples() }: Props) {
  const { id = '' } = useParams();
  const { state, retry } = useExplanation(id, load);
  if (state.kind !== 'ok') return <StatusView state={state} onRetry={retry} />;
  return <ExplanationDocument document={state.document} notice={sampleMode ? SAMPLE_NOTICE : undefined} />;
}
