---
paths:
  - "apps/backend/src/capabilities/candidates/**/*.ts"
  - "apps/backend/src/capabilities/ai/**/*.ts"
  - "apps/frontend/src/features/candidates/**/*.{ts,tsx}"
---

# CV, PII y uso de ICA (CAND-2)

Un CV es PII completa. El envío a ICA está aceptado solo para la POC (DT-030); estas reglas limitan el daño y no se negocian.

## Datos y logs
- Nunca loguear el contenido del CV ni los campos extraídos (nombre, email, teléfono, LinkedIn, experiencia). Solo ids, longitudes, `extractor` y `reason`.
- `@TraceFlow()` nunca sobre un método que reciba el CV, el texto extraído o el borrador.
- Todo handler (o controller) que reciba o devuelva un CV, datos de candidatos o texto libre para la IA lleva `@NoBodyLog()` (FlowLog imprime solo `{ omitted, length }`). Un endpoint nuevo de ese tipo (p. ej. el brochure de OPP-AI-1) se marca desde su creación y con un test de metadata (DT-055).
- El archivo del CV no se guarda (no hay COS): se procesa en memoria y se descarta. Nada en disco ni en Mongo.
- El borrador (`ICandidateProfileDraft`) nunca se persiste. Solo `POST /candidates` crea un `Candidate`, tras confirmación humana.
- Fixtures y tests: solo CV inventados. Prohibido cualquier dato real.

## Clave de ICA
- Solo vive en `ConfigService`/`.env`. Nunca se imprime, loguea, devuelve ni se pasa a un sub-agente.
- Leer el `.env` con `grep`/`cut`, nunca con `source`.
- Comprobar fugas con `grep -rlF` mostrando solo el recuento.

## Subida de archivos
- Lista cerrada: PDF y DOCX. Validar la firma del archivo (magic bytes), no solo el MIME o la extensión. `.doc` heredado → 400 claro.
- Tamaño máximo por variable de entorno (anti-hardcoding); vacío, corrupto o excedido → 400.
- `@Throttle` estricto en el endpoint de extracción.
- Tras extraer, borrar el archivo en ICA (`DELETE /files/{id}`), también si la extracción falla.

## Fallos de IA
- Un fallo de ICA es 503 con `reason`, nunca 401 (el `httpClient` del frontend cierra la sesión ante un 401).
- Sin cambio silencioso de extractor: el resultado siempre indica `extractor`, y el reintento en Clásica es una acción explícita del usuario.
- El coordinator nunca lanza; devuelve `{ ok, ... }`.
- La espera de `files` (polling) respeta `AI_TOTAL_TIMEOUT_MS`.

## Prompt injection
- El CV es entrada no confiable: se trata como datos, nunca como instrucciones.
- La salida del modelo se valida contra el esquema y se descarta lo que no encaje.
- El modelo solo propone un borrador; nunca ejecuta acciones.
- Mantener un test con un CV que contenga instrucciones maliciosas.

## Frontend
- No guardar el archivo ni el borrador en `localStorage`/`sessionStorage`. El borrador vive en estado del formulario y se descarta al salir.
- Los `missingFields` se resaltan, no se rellenan con valores inventados.
