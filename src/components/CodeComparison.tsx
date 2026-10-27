/**
 * Código antes y después, lado a lado (en el celular, uno debajo del otro).
 * "Antes" son solo los métodos que se mueven; "Después", cada clase extraída. Una sugerencia de
 * fragmento no tiene "antes": se muestra solo el código sugerido, a todo el ancho.
 */

import type { CodeBlock, ExplanationCode } from '../api/types';
import { CodeView } from './CodeView';

function Column({ heading, blocks }: { heading: string; blocks: CodeBlock[] }) {
  return (
    <div className="comparison__column">
      <h3>{heading}</h3>
      {blocks.map((block) => (
        <figure key={block.title} className="code-block">
          <figcaption>
            <code>{block.title}</code>
          </figcaption>
          <CodeView code={block.code} label={`${heading}: ${block.title}`} />
        </figure>
      ))}
    </div>
  );
}

export function CodeComparison({ code }: { code: ExplanationCode }) {
  if (code.before.length === 0) {
    return (
      <div className="comparison comparison--single">
        <Column heading="Código sugerido" blocks={code.after} />
      </div>
    );
  }
  return (
    <div className="comparison">
      <Column heading="Antes" blocks={code.before} />
      <Column heading="Después" blocks={code.after} />
    </div>
  );
}
