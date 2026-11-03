# PattronDesingDetector-Implementaciones

App web del documento técnico de **"Ver implementación"**. Desde la extensión de VS Code, un link abre la explicación de un refactor: qué principio se rompía (con la evidencia real del detector), por qué se eligió esa solución y qué cambia.

- **Stack:** Vite + React + TypeScript, publicada en GitHub Pages.
- **App publicada:** `https://semillerosolid.github.io/PattronDesingDetector-Implementaciones/`
- **Documento de ejemplo:** `https://semillerosolid.github.io/PattronDesingDetector-Implementaciones/#/implementacion/ejemplo`

## Cómo llega un documento hasta acá

1. En la extensión, el usuario usa **Ver implementación**, desde la barra del diff o desde la fila del panel Resumen.
2. La primera vez, la extensión pide permiso para publicar (ajuste `prueba.publishExplanations`). Sin permiso no se envía nada.
3. La extensión pide la explicación (`POST /analyze/explain`) y la publica (`POST /explanations`). Las dos llamadas llevan la API key.
4. El backend guarda el documento por 30 días y devuelve el link: `EXPLANATION_PAGE_URL` con el id, por ejemplo `…/#/implementacion/dHeSW2FyUVZVe3qhcuwCAA`.
5. La extensión abre el link en el navegador. Esta app lee el documento con `GET /explanations/:id`, que es público y no lleva API key.

Qué datos se publican, quién los puede ver, cuánto duran y cómo se borran está decidido en el [ADR 0002 del backend](https://github.com/SemilleroSOLID/pattern-design-detector-backend/blob/develop/docs/adr/0002-ver-implementacion-publicacion.md). Resumen: solo la explicación (los métodos que se mueven y el código sugerido, nunca el archivo completo), visible para quien tenga el link, y se borra sola al vencer.

## Rutas

| Ruta | Qué muestra |
|---|---|
| `/#/` | Portada. Sin backend configurado, lista los documentos de ejemplo. |
| `/#/implementacion/:id` | El documento `:id`, leído de `GET /explanations/:id`. |

Se usa hash (`#/`) porque GitHub Pages no reescribe rutas: con historial normal, recargar un link profundo daría 404.

## El documento

`/#/implementacion/:id` muestra la explicación en secciones desplegables:

| Sección | Qué trae |
|---|---|
| Qué se incumplía | Principio y hallazgo, la evidencia del detector con su umbral y por qué se rompe. |
| Por qué esta solución | El problema en esa clase y la solución elegida. |
| Alternativas descartadas | Cada una con el motivo. |
| Riesgos al aplicarla | Lo que hay que cuidar. |
| Antes y después | Métodos, atributos y complejidad ciclomática antes y después, y el código lado a lado con resaltado Java (en el celular, uno debajo del otro). |

- **Apertura:** arranca con la primera sección abierta. "Expandir todo" y "Contraer todo" están en la barra, junto al estado del QA (verificada o no).
- **Imprimir o PDF:** el botón abre el diálogo de impresión del navegador, y desde ahí se guarda como PDF. Al imprimir se despliegan todas las secciones, se ocultan la barra y la navegación, y el código se parte en líneas en vez de cortarse.
- **Sin narrativa de la IA:** las secciones que dependen de ella lo avisan, y la evidencia, las métricas y el código se muestran igual.
- **Documentos anteriores:** si un documento no trae código o complejidad, esas partes no aparecen.

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

Sin backend configurado (`VITE_API_BASE_URL` vacía), la app funciona con documentos de ejemplo. Sirven para trabajar en la página sin levantar el backend. Hay uno por cada estado de la página:

| id | Estado |
|---|---|
| `ejemplo` | Documento completo: God Class en `JsonObject` de Gson. La evidencia y las métricas son las reales que devuelve `POST /analyze/explain`; la narrativa está escrita a mano para mostrar el formato, y la página lo avisa. |
| `ejemplo-sin-ia` | La IA no escribió la narrativa: solo evidencia y métricas. |
| `ejemplo-vencido` | Documento vencido. |
| `ejemplo-dormido` | El backend no despierta a tiempo. |
| cualquier otro | Documento inexistente. |

## Contrato de `GET /explanations/:id`

Lo sirve el backend (`pattern-design-detector-backend`, `docs/openapi.yaml`). Es público y de solo lectura: no lleva API key. El documento se publica antes con `POST /explanations`, que sí la lleva, desde la extensión.

| Respuesta | Significado en la app |
|---|---|
| `200` + `PublishedExplanation` | El documento. Si `expiresAt` ya pasó, se muestra como vencido. |
| `404` | El documento no existe **o ya venció**. El backend responde lo mismo a propósito, para que el link no revele si un documento existió; la página muestra "no existe o ya venció". |
| `410` | Vencido (la app lo entiende, aunque el backend hoy usa 404). |
| `502` / `503` / `504` o conexión caída | El backend está despertando (cold start de Render free) o su storage no responde. La app reintenta con esperas crecientes durante 90 s y avisa que puede tardar. Si no despierta, muestra "backend dormido" con un botón para reintentar. |
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

## Apuntar al backend

La app solo lee: nunca publica. Para ver un documento real hay que publicarlo antes en el backend.

### En local, de punta a punta

1. **Backend** (`pattern-design-detector-backend`), con el origen de la app permitido y el link apuntando a la app local. Con PowerShell:

   ```powershell
   $env:CORS_ALLOWED_ORIGINS='["http://localhost:5173"]'
   $env:EXPLANATION_PAGE_URL='http://localhost:5173/PattronDesingDetector-Implementaciones/#/implementacion/{id}'
   uvicorn app.main:app --port 8000
   ```

   Sin `CORS_ALLOWED_ORIGINS`, el navegador bloquea la lectura. La app la ve como una conexión caída: reintenta durante 90 s y termina en "backend dormido".

2. **App**, apuntando a ese backend:

   ```bash
   VITE_API_BASE_URL=http://localhost:8000 npm run dev            # bash
   $env:VITE_API_BASE_URL='http://localhost:8000'; npm run dev    # PowerShell
   ```

   (o `VITE_API_BASE_URL=http://localhost:8000` en un `.env.local`).

3. **Publicar un documento**, de una de estas dos formas:
   - con la extensión, usando **Ver implementación** con `prueba.backendUrl` en `http://localhost:8000`;
   - a mano, con una explicación de `POST /analyze/explain`:

   ```bash
   # explicacion.json = {"explanation": { ... }}
   curl -X POST http://localhost:8000/explanations -H "Content-Type: application/json" --data-binary @explicacion.json
   ```

   La respuesta trae `url`: abrirla en el navegador.

### En producción

La app publicada lee el backend de la variable de repo `API_BASE_URL`, que se toma al compilar (ver "Deploy"). Para que muestre documentos reales tienen que cumplirse tres cosas:

- **La variable:** `API_BASE_URL` con la URL del backend de Render.
- **CORS:** el backend de Render permite el origen `https://semillerosolid.github.io` en `CORS_ALLOWED_ORIGINS`. Ya está en el `render.yaml` del backend; si el servicio no sigue el Blueprint, hay que cargarla a mano en el dashboard.
- **El backend desplegado** incluye `POST /explanations` y `GET /explanations/{id}`.

Si falta alguna, la app publicada no muestra documentos reales:

- **Sin la variable:** sigue en modo ejemplo.
- **Sin CORS:** cada lectura termina en "backend dormido".
- **Sin el endpoint:** los links dan "no existe o ya venció".

## Deploy

- **CI** (`.github/workflows/ci.yml`): en cada PR, y en cada push a `main`, corre `typecheck`, tests y build.
- **Deploy** (`.github/workflows/deploy.yml`): al mergear a `main` (o a mano desde Actions → "Deploy a GitHub Pages"), compila y publica en GitHub Pages.

Configuración, una sola vez:

1. El repo tiene que ser **público**: la organización está en el plan gratuito y ahí Pages solo funciona en repos públicos.
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Secrets and variables → Actions → Variables → `API_BASE_URL` con la URL del backend (por ejemplo `https://pattern-design-detector-backend.onrender.com`). Sin esa variable, la app publicada usa los documentos de ejemplo.

Como `API_BASE_URL` se lee al compilar, cambiarla no alcanza: hay que volver a desplegar (Actions → "Deploy a GitHub Pages" → Run workflow).
