---
name: prompt-deep
description: Profundiza una tarea ANTES de planificarla. Entrevista al usuario, diagnostica como un experto (qué falta, fuentes primarias, métodos, riesgos, evidencia de éxito) y reescribe el prompt final. Úsala solo si la tarea cumple 2 de 5 criterios (decisión abierta, difícil de revertir, integración externa, sin patrón previo, riesgo de seguridad/PII). No la uses para CRUDs, fixes conocidos ni a mitad de una implementación.
allowed-tools: Read, Grep, Glob
---

# prompt-deep

Objetivo: una versión MÁS PROFUNDA de la tarea, no más grande.
Modo SOLO LECTURA: no modifiques archivos, no ejecutes la tarea.
Contexto permitido: CLAUDE.md, ROADMAP.md, .claude/rules/, docs/use-cases/,
docs/architecture/README.md y el código. Nunca legacy_docs/.

## Entrada ($ARGUMENTS), tres modos
1. Vacío → entrevista completa (Fase 0).
2. Un ID o frase ("MATCH-1", "bug del 401 tardío") → lee lo que exista en el repo
   sobre eso y pregunta SOLO lo que falte.
3. Un objeto con estos campos (cualquiera puede faltar):
   tarea:        qué hay que lograr
   origen:       HU | requisito | bug | ADR | convención | estándar | demo
   campo:        software dev | arquitectura | QA | seguridad | datos | IA | producto
   rol_experto:  ej. "arquitecto senior de integraciones"
   marco:        estándares o referencias (SOLID, DDD, OWASP ASVS, ISO 27001, BIAN...)
   contexto:     estado actual, usuarios del resultado, para qué decisión sirve
   restricciones: stack, plazos, reglas del repo, lo que NO se puede cambiar
   evidencia:    cómo sabrás que salió bien, si ya lo sabes
   salida:       prompt de HU | ADR | plan de debugging | guion de demo

## Fase 0 — Entrevista (máx. 2 rondas, máx. 5 preguntas por ronda)
- Pregunta solo lo que no puedas leer en el repo.
- Cada pregunta trae una opción por defecto propuesta, para responder con "ok".
- Si un campo no se responde, infiérelo y márcalo [INFERIDO].
- rol_experto y marco: si no vienen, propón 1 o 2 opciones justificadas.
  Nunca inventes cláusulas de un estándar: si no estás seguro de un detalle
  normativo, dilo.
- Entrega un BRIEF de 10 líneas con todos los campos y espera "ok" o correcciones.

## Fase 1 — Diagnóstico (máx. 120 líneas, concreto para ESTA tarea)
Prohibido el consejo genérico: cada punto debe aplicarse mañana en este repo.
1. Reencuadre: el problema real detrás del pedido. Si pido lo equivocado, dilo.
2. Lo que haría {rol_experto} que no estoy pidiendo (máx. 7): qué, por qué aquí,
   qué riesgo evita.
3. Material primario (máx. 7): código, logs, datos, specs oficiales, mediciones,
   usuarios. Con ruta o comando real; si no existe, cómo obtenerlo.
4. Métodos y herramientas (máx. 7): para qué paso y por qué ganan a la alternativa obvia.
5. Riesgos y qué NO hacer (máx. 5).
6. Qué recortaría (máx. 5) para ganar profundidad sin volumen.
7. Evidencia de éxito: criterios observables, cada uno con cómo comprobarlo
   (test, comando, métrica con umbral, revisión de un usuario). Nada subjetivo.
8. Supuestos vs hechos, y preguntas que cambiarían la respuesta (máx. 5).
Marca cada recomendación [ALTA] / [MEDIA] / [BAJA] según tu confianza.
DETENTE y espera "reescribe" o correcciones.

## Fase 2 — Reescritura (solo tras "reescribe")
Entrega ÚNICAMENTE el prompt final, autocontenido y en español (identificadores
de código en inglés), listo para una sesión nueva, con este orden:
contexto mínimo · fuentes a leer · decisiones ya tomadas · Fase 0 verificación ·
Fase 1 plan con punto de aprobación · implementación por subagente · criterios
de aceptación verificables (Gherkin si es una HU) · verificación real ·
documentación (solo dueños únicos) · commits · formato de entrega.
Si el prompt final supera ~150 líneas, divídelo en "Parte 1" y "Parte 2"
y entrégalas en mensajes separados para que no se corte.