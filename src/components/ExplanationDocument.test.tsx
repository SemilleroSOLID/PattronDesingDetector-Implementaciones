import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { loadSample } from '../api/samples';
import type { PublishedExplanation } from '../api/types';
import { CodeComparison } from './CodeComparison';
import { highlightJava } from './CodeView';
import { ExplanationDocument, SECTIONS } from './ExplanationDocument';
import { QaBadge } from './QaBadge';

async function sample(id: string): Promise<PublishedExplanation> {
  const result = await loadSample(id, { sleep: async () => {} });
  if (result.kind !== 'ok') throw new Error(`sin ejemplo ${id}`);
  return result.document;
}

const section = (title: string) => screen.getByRole('heading', { name: title, level: 2 }).closest('details')!;

describe('ExplanationDocument', () => {
  it('arranca con la primera sección abierta y cada una se despliega al hacer clic', async () => {
    render(<ExplanationDocument document={await sample('ejemplo')} />);
    expect(section('Qué se incumplía')).toHaveAttribute('open');
    for (const { title } of SECTIONS.slice(1)) {
      expect(section(title)).not.toHaveAttribute('open');
      await userEvent.click(screen.getByRole('heading', { name: title, level: 2 }));
      expect(section(title)).toHaveAttribute('open');
    }
    await userEvent.click(screen.getByRole('heading', { name: 'Qué se incumplía', level: 2 }));
    expect(section('Qué se incumplía')).not.toHaveAttribute('open');
  });

  it('expandir y contraer todo', async () => {
    render(<ExplanationDocument document={await sample('ejemplo')} />);
    await userEvent.click(screen.getByRole('button', { name: 'Expandir todo' }));
    SECTIONS.forEach(({ title }) => expect(section(title)).toHaveAttribute('open'));
    await userEvent.click(screen.getByRole('button', { name: 'Contraer todo' }));
    SECTIONS.forEach(({ title }) => expect(section(title)).not.toHaveAttribute('open'));
  });

  it('al imprimir despliega todas las secciones y después las deja como estaban', async () => {
    render(<ExplanationDocument document={await sample('ejemplo')} />);
    act(() => void window.dispatchEvent(new Event('beforeprint')));
    SECTIONS.forEach(({ title }) => expect(section(title)).toHaveAttribute('open'));
    act(() => void window.dispatchEvent(new Event('afterprint')));
    expect(section('Qué se incumplía')).toHaveAttribute('open');
    expect(section('Antes y después')).not.toHaveAttribute('open');
  });

  it('el botón de imprimir abre el diálogo del navegador (de ahí sale el PDF)', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<ExplanationDocument document={await sample('ejemplo')} />);
    await userEvent.click(screen.getByRole('button', { name: 'Imprimir o PDF' }));
    expect(print).toHaveBeenCalledOnce();
  });

  it('antes y después: métricas con la complejidad y el código lado a lado', async () => {
    render(<ExplanationDocument document={await sample('ejemplo')} />);
    const body = within(section('Antes y después'));
    expect(body.getByRole('row', { name: /Métodos 19 12 -7/ })).toBeInTheDocument();
    expect(body.getByRole('row', { name: /Complejidad ciclomática 28 17 -11/ })).toBeInTheDocument();
    expect(body.getByRole('heading', { name: 'Antes' })).toBeInTheDocument();
    expect(body.getByRole('heading', { name: 'Después' })).toBeInTheDocument();
    expect(body.getByLabelText('Después: JsonObjectTypedAccess')).toHaveTextContent('getAsJsonPrimitive');
  });

  it('muestra el estado del QA', async () => {
    render(<ExplanationDocument document={await sample('ejemplo')} />);
    expect(screen.getByText('Sin verificar por el QA')).toBeInTheDocument();
  });
});

describe('QaBadge', () => {
  it('verificada, sin verificar o nada si el documento no lo dice', () => {
    const { rerender, container } = render(<QaBadge status="verified" />);
    expect(screen.getByText('✓ Verificada por el QA')).toBeInTheDocument();
    rerender(<QaBadge status={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('CodeComparison', () => {
  it('una sugerencia de fragmento muestra solo el código sugerido', () => {
    render(<CodeComparison code={{ before: [], after: [{ title: 'Código sugerido', code: 'class A {}' }] }} />);
    expect(screen.getByRole('heading', { name: 'Código sugerido' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Antes' })).not.toBeInTheDocument();
  });
});

describe('highlightJava', () => {
  it('resalta palabras clave', () => {
    expect(highlightJava('public class A {}')).toContain('<span class="hljs-keyword">public</span>');
  });

  it('escapa el HTML del código: nunca inserta etiquetas del usuario', () => {
    const html = highlightJava('String s = "<script>alert(1)</script>"; // <img src=x onerror=alert(1)>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
    const { container } = render(<pre dangerouslySetInnerHTML={{ __html: html }} />);
    expect(container.querySelector('script, img')).toBeNull();
  });

});
