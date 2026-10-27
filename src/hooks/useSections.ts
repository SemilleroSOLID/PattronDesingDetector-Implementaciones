/**
 * Qué secciones del documento están desplegadas.
 *
 * Arranca con `initiallyOpen` abiertas. `expandAll`/`collapseAll` son los botones de la barra.
 * Al imprimir (o exportar a PDF desde el navegador) se despliegan todas, para que el papel tenga el
 * documento completo, y al terminar vuelven como estaban.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export function useSections(ids: readonly string[], initiallyOpen: readonly string[]) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(initiallyOpen));
  const beforePrint = useRef<Set<string> | null>(null);

  const toggle = useCallback((id: string) => {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const expandAll = useCallback(() => setOpen(new Set(ids)), [ids]);
  const collapseAll = useCallback(() => setOpen(new Set()), []);

  useEffect(() => {
    const onBeforePrint = () =>
      setOpen((current) => {
        beforePrint.current = current;
        return new Set(ids);
      });
    const onAfterPrint = () => {
      if (beforePrint.current) setOpen(beforePrint.current);
      beforePrint.current = null;
    };
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, [ids]);

  return { isOpen: (id: string) => open.has(id), toggle, expandAll, collapseAll };
}
