/**
 * Una sección desplegable del documento. Es un `<details>` controlado por estado (no el toggle nativo):
 * así los botones "Expandir/Contraer todo" y la impresión pueden abrirlas todas. El título es un `<h2>`
 * dentro del `<summary>`, para que siga siendo un encabezado para lectores de pantalla.
 */

import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}

export function Section({ id, title, open, onToggle, children }: Props) {
  return (
    <details className="section" open={open} id={id}>
      <summary
        onClick={(event) => {
          event.preventDefault();
          onToggle(id);
        }}
      >
        <h2>{title}</h2>
      </summary>
      <div className="section__body">{children}</div>
    </details>
  );
}
