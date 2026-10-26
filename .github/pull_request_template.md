## Qué resuelve

Closes #

<!-- Qué cambia y por qué, en dos o tres líneas. "Closes #N" mueve la tarjeta del tablero sola al mergear. -->

## Cómo probarlo

<!-- Pasos para ver el cambio funcionando. -->

## Capturas / video

<!--
Obligatorio: sin esto el PR no se revisa.
Arrastrá las imágenes o el video a este cuadro, o pegá un link a Drive o YouTube (no listado).
Los videos, de menos de 2 minutos.
Qué mostrar en esta app: capturas de la página publicada (o de `npm run preview`) en el caso real y en los estados de carga y error; si cambia el deploy, la corrida en Actions.
Si la issue tiene la sección "Evidencia en el PR", subí exactamente eso.
Si el cambio no tiene nada que se vea (CI, refactor interno), pegá la salida del comando o de los tests en un bloque de código.
-->

## Checklist

- [ ] `npm test` pasa en local
- [ ] `npm run typecheck` y `npm run build` sin errores
- [ ] Si cambia el contrato con el backend (`src/api/types.ts`), está alineado con `docs/openapi.yaml` del backend
