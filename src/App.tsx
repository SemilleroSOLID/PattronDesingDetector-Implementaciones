/**
 * Rutas con hash (`/#/implementacion/:id`): GitHub Pages no reescribe rutas,
 * así que un link profundo con historial normal daría 404 al recargar.
 */

import { HashRouter, Link, Navigate, Route, Routes } from 'react-router-dom';

import { DocumentPage } from './pages/DocumentPage';
import { HomePage } from './pages/HomePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/implementacion/:id" element={<DocumentPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <HashRouter>
      <div className="layout">
        <nav className="topbar">
          <Link to="/" className="brand">
            Pattern Detector
          </Link>
          <span className="topbar__subtitle">Ver implementación</span>
        </nav>
        <main>
          <AppRoutes />
        </main>
        <footer className="footer">Semillero SOLID · Universidad de Caldas</footer>
      </div>
    </HashRouter>
  );
}
