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
Qué mostrar en el backend: capturas de la request y la respuesta del endpoint (Swagger en `/docs` o `curl`) con un caso real y con el caso de error; si cambia el contrato, también la salida de `python scripts/check_openapi_drift.py`.
Si la issue tiene la sección "Evidencia en el PR", subí exactamente eso.
Si el cambio no tiene nada que se vea (CI, refactor interno), pegá la salida del comando o de los tests en un bloque de código.
-->

## Checklist

- [ ] `pytest` pasa en local
- [ ] `python -m scripts.code_rules` sin errores
- [ ] Si cambia `docs/openapi.yaml`, el PR en el repo de Docs está enlazado y el drift da cero
