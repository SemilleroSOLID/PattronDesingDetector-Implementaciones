/**
 * Código Java con resaltado de sintaxis (highlight.js: solo el núcleo y el lenguaje Java, unos KB).
 * highlight.js escapa el código antes de envolver los tokens en `<span>`, así que el HTML que se inserta
 * no puede traer etiquetas del código del usuario.
 */

import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import { useMemo } from 'react';

hljs.registerLanguage('java', java);

export function highlightJava(code: string): string {
  return hljs.highlight(code, { language: 'java', ignoreIllegals: true }).value;
}

export function CodeView({ code, label }: { code: string; label: string }) {
  const html = useMemo(() => highlightJava(code), [code]);
  return (
    <pre className="code" aria-label={label}>
      <code className="hljs language-java" dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}
