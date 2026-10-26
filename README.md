# PattronDesingDetector-Implementaciones

App web del documento técnico de **"Ver implementación"**. Desde la extensión de VS Code, un link abre la explicación de un refactor: qué principio se rompía (con la evidencia real del detector), por qué se eligió esa solución y qué cambia.

- **Stack:** Vite + React + TypeScript, publicada en GitHub Pages.
- **App publicada:** `https://semillerosolid.github.io/PattronDesingDetector-Implementaciones/`
- **Documento de ejemplo:** `https://semillerosolid.github.io/PattronDesingDetector-Implementaciones/#/implementacion/ejemplo`

## Rutas

| Ruta | Qué muestra |
|---|---|
| `/#/` | Portada. Sin backend configurado, lista los documentos de ejemplo. |
| `/#/implementacion/:id` | El documento `:id`, leído de `GET /explanations/:id`. |

Se usa hash (`#/`) porque GitHub Pages no reescribe rutas: con historial normal, recargar un link profundo daría 404.

## Correr en local

```bash
npm install
npm run dev          # http://localhost:5173/PattronDesingDetector-Implementaciones/
npm test             # vitest
npm run typecheck
npm run build        # dist/
```

Variables (ver `.env.example`):

| Variable | Default | Qué hace |
|---|---|---|
| `VITE_API_BASE_URL` | vacía | URL del backend que sirve `GET /explanations/:id`. **Vacía = modo ejemplo**: la app usa los documentos de `src/api/samples.ts`. |
| `VITE_BASE` | `/PattronDesingDetector-Implementaciones/` | Ruta base de la app (en Pages es `/<repo>/`). |

## Documentos de ejemplo

Mientras el endpoint del backend no exista, la app funciona con documentos de ejemplo. Hay uno por cada estado de la página:

| id | Estado |
|---|---|
| `ejemplo` | Documento completo: God Class en `JsonObject` de Gson. La evidencia y las métricas son las reales que devuelve `POST /analyze/explain`; la narrativa está escrita a mano para mostrar el formato, y la página lo avisa. |
| `ejemplo-sin-ia` | La IA no escribió la narrativa: solo evidencia y métricas. |
| `ejemplo-vencido` | Documento vencido. |
| `ejemplo-dormido` | El backend no despierta a tiempo. |
| cualquier otro | Documento inexistente. |

## Contrato esperado de `GET /explanations/:id`

Lo implementa el backend en "Publicar la explicación". La app espera esto:

| Respuesta | Significado en la app |
|---|---|
| `200` + `PublishedExplanation` | El documento. Si `expiresAt` ya pasó, se muestra como vencido. |
| `404` | Documento inexistente. |
| `410` | Documento vencido. |
| `502` / `503` / `504` o conexión caída | El backend está despertando (cold start de Render free). La app reintenta con esperas crecientes durante 90 s y avisa que puede tardar. Si no despierta, muestra "backend dormido" con un botón para reintentar. |
| otro código | Error, con un botón para reintentar. |

```ts
interface PublishedExplanation {
  id: string;
  createdAt: string;        // ISO 8601
  expiresAt: string | null; // ISO 8601; null = no vence
  explanation: RefactorExplanation; // el mismo esquema de POST /analyze/explain
}
```

Los tipos están en `src/api/types.ts`. `RefactorExplanation` replica el esquema del backend (`docs/openapi.yaml` de pattern-design-detector-backend).

La página pide el documento desde el navegador, así que el backend tiene que permitir el origen `https://semillerosolid.github.io` en `CORS_ALLOWED_ORIGINS`. El endpoint es de solo lectura y no lleva API key: el id del link es lo que da acceso.

## Deploy

- **CI** (`.github/workflows/ci.yml`): en cada PR, y en cada push a `main`, corre `typecheck`, tests y build.
- **Deploy** (`.github/workflows/deploy.yml`): al mergear a `main` (o a mano desde Actions → "Deploy a GitHub Pages"), compila y publica en GitHub Pages.

Configuración, una sola vez:

1. El repo tiene que ser **público**: la organización está en el plan gratuito y ahí Pages solo funciona en repos públicos.
2. Settings → Pages → Source: **GitHub Actions**.
3. Opcional: Settings → Secrets and variables → Actions → Variables → `API_BASE_URL` con la URL del backend (por ejemplo `https://pattern-design-detector-backend.onrender.com`). Sin esa variable, la app publicada usa los documentos de ejemplo.
