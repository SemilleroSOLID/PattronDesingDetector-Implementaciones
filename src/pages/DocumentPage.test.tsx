import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { loadSample } from '../api/samples';
import type { ExplanationResult } from '../api/types';
import { DocumentPage } from './DocumentPage';

type Loader = (id: string, signal: AbortSignal, onWaking: () => void) => Promise<ExplanationResult>;

const instantSamples: Loader = (id, _signal, onWaking) => loadSample(id, { onWaking, sleep: async () => {} });

function renderPage(id: string, load: Loader, sampleMode = true) {
  return render(
    <MemoryRouter initialEntries={[`/implementacion/${id}`]}>
      <Routes>
        <Route path="/implementacion/:id" element={<DocumentPage load={load} sampleMode={sampleMode} />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DocumentPage', () => {
  it('muestra el documento de ejemplo con la evidencia real, la narrativa y las métricas', async () => {
    renderPage('ejemplo', instantSamples);
    expect(await screen.findByRole('heading', { name: 'Clase Dios (God Class) en JsonObject' })).toBeInTheDocument();
    expect(screen.getByText('19 métodos y 1 atributos (umbral 15/10)')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Alternativas descartadas' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Métodos 19 12 -7/ })).toBeInTheDocument();
    expect(screen.getByText(/Documento de ejemplo/)).toBeInTheDocument();
  });

  it('sin la narrativa de la IA muestra igual la evidencia y avisa', async () => {
    renderPage('ejemplo-sin-ia', instantSamples);
    expect(await screen.findByText(/La explicación de la IA no está disponible/)).toBeInTheDocument();
    expect(screen.getByText('19 métodos y 1 atributos (umbral 15/10)')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'La solución elegida' })).not.toBeInTheDocument();
  });

  it('muestra la carga mientras llega el documento', () => {
    renderPage('ejemplo', () => new Promise(() => {}));
    expect(screen.getByRole('heading', { name: 'Cargando el documento…' })).toBeInTheDocument();
  });

  it('avisa que el backend está despertando', async () => {
    renderPage('x', (_id, _signal, onWaking) => {
      onWaking();
      return new Promise(() => {});
    });
    expect(await screen.findByRole('heading', { name: 'Despertando el servidor…' })).toBeInTheDocument();
    expect(screen.getByText(/puede tardar hasta un minuto/)).toBeInTheDocument();
  });

  it('documento vencido e inexistente', async () => {
    const { unmount } = renderPage('ejemplo-vencido', instantSamples);
    expect(await screen.findByRole('heading', { name: 'Este documento venció' })).toBeInTheDocument();
    expect(screen.getByText(/Estuvo disponible hasta el 1 de octubre de 2026/)).toBeInTheDocument();
    unmount();
    renderPage('no-existe', instantSamples);
    expect(await screen.findByRole('heading', { name: 'No encontramos este documento' })).toBeInTheDocument();
  });

  it('backend dormido: ofrece reintentar y reintenta', async () => {
    const load = vi.fn<Loader>(async () => ({ kind: 'sleeping' }));
    renderPage('abc', load, false);
    expect(await screen.findByRole('heading', { name: 'El servidor no respondió a tiempo' })).toBeInTheDocument();
    load.mockImplementationOnce((_id, signal, onWaking) => instantSamples('ejemplo', signal, onWaking));
    await act(() => userEvent.click(screen.getByRole('button', { name: 'Reintentar' })));
    expect(await screen.findByText('19 métodos y 1 atributos (umbral 15/10)')).toBeInTheDocument();
    expect(screen.queryByText(/Documento de ejemplo/)).not.toBeInTheDocument();
  });
});
