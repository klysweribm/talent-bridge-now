# Oportunidad asistida por IA (OPP-AI-1)

Etapa 1 del flujo (Creación) fortalecida con IA: el box mágico y el brochure generan un borrador, y la banca sugiere recursos en la etapa 2. Términos según [`../glossary.md`](../glossary.md) (Oportunidad = `Process` en el código).

## Resumen de permisos

| Acción | Endpoint | PM | Reclutador | Referente técnico | Sin token |
| --- | --- | --- | --- | --- | --- |
| Generar borrador desde texto | `POST /ai/opportunity-draft` | ✅ | ✅ | 403 | 401 |
| Generar borrador desde brochure | `POST /ai/opportunity-draft/file` | ✅ | ✅ | 403 | 401 |
| Sugerencias de la banca (perfil sin oportunidad) | `POST /bench/match` | ✅ | ✅ | 403 | 401 |
| Sugerencias de la banca (oportunidad creada) | `GET /processes/:id/bench-suggestions` | ✅ | ✅ | 403 | 401 |

## Reglas

- **R1.** El borrador solo rellena el formulario; no crea nada. Nada se guarda hasta "Crear oportunidad".
- **R2.** Un campo que la IA no puede inferir queda vacío (nunca inventado) y se avisa.
- **R3.** El brochure se procesa en memoria y se descarta: no se guarda en disco, base de datos ni logs. Los logs registran solo longitud, latencia y resultado, nunca el contenido.
- **R4.** El % de match lo calcula el backend de forma determinística (60 % skills, 25 % banda (misma banda 100, diferencia de 1 → 50, resto 0), 15 % disponibilidad). La IA solo explica y nunca recibe nombre, código ni datos de contacto.
- **R5.** Si no hay `startDate`, el desglose muestra "Disponibilidad: no evaluada" y los pesos se redistribuyen entre skills y banda. Nunca en silencio.
- **R6.** Si ICA falla o tarda, el flujo manual y el panel de sugerencias siguen funcionando (sin la frase de la IA).
- **R7.** Solo se sugieren recursos `available` o `soft_booked`. No hay acción de asignar: solo sugerir.

## Códigos de error estables

`AI_UNAVAILABLE`, `AI_TIMEOUT`, `OPPORTUNITY_SOURCE_UNREADABLE` (422), `OPPORTUNITY_TEXT_TOO_LONG`.

## Gherkin

```gherkin
# language: es
Característica: Oportunidad asistida por IA (OPP-AI-1)
  Como PM o reclutador
  Quiero describir el perfil buscado y recibir sugerencias de la banca
  Para crear oportunidades más rápido, con menos errores y priorizando talento interno

  Antecedentes:
    Dado que inicio sesión como "mariana@ibm.com" con rol "pm"

  Escenario: Generar la oportunidad desde texto libre
    Dado que estoy en la etapa 1 de "Nueva oportunidad"
    Cuando escribo en el box mágico "Fullstack senior React y NestJS para ITAU, 6 meses, inicio en diciembre"
    Y pulso "Generar con IA"
    Entonces el formulario se rellena con título, cliente, banda y stack
    Y los campos rellenados muestran "Sugerido por IA"
    Y no se crea ninguna oportunidad hasta que pulso "Crear oportunidad"

  Escenario: Campos que la IA no pudo inferir
    Cuando genero la oportunidad con un texto que no menciona al cliente
    Entonces el campo cliente queda vacío
    Y veo un aviso de campos por completar

  Escenario: Generar desde un brochure
    Cuando subo el brochure "Requerimiento_ITAU.pdf"
    Entonces el formulario se rellena igual que con el texto libre
    Y el archivo no se guarda en el servidor

  Escenario: Brochure ilegible
    Cuando subo un PDF sin texto extraíble
    Entonces veo "No pudimos leer el documento"
    Y el formulario queda intacto

  Escenario: ICA no responde al generar
    Dado que ICA no está disponible
    Cuando pulso "Generar con IA"
    Entonces veo un mensaje claro de error
    Y puedo completar el formulario manualmente

  Escenario: Skills normalizadas
    Cuando la IA devuelve "Reactjs" y "Nestjs"
    Entonces el formulario muestra "React" y "NestJS"

  Escenario: Sugerencias de la banca en la etapa 2
    Dado que completé el perfil con React, NestJS y banda 8
    Cuando avanzo a la etapa 2
    Entonces veo "Sugeridos de la banca" ordenados por % de match
    Y los recursos con 75% o más muestran "Recomendado"
    Y cada recurso muestra skills que cumple y que le faltan

  Escenario: El porcentaje no depende de ICA
    Dado que ICA no está disponible
    Cuando avanzo a la etapa 2
    Entonces veo los recursos con su % y su desglose
    Y no veo la explicación generada por IA

  Escenario: Sin coincidencias suficientes
    Dado que ningún recurso de la banca llega al umbral
    Cuando avanzo a la etapa 2
    Entonces veo "Sin coincidencias suficientes en la banca"
    Y la acción "Buscar candidatos externos"

  Escenario: Cambiar el perfil recalcula las sugerencias
    Dado que estoy en la etapa 2 con sugerencias visibles
    Cuando vuelvo a la etapa 1 y agrego la skill "AWS"
    Y avanzo otra vez a la etapa 2
    Entonces las sugerencias se recalculan con el perfil nuevo

  Escenario: Sugerencias en el detalle de la oportunidad
    Dado que la oportunidad "ITAU" ya está creada
    Cuando abro su detalle
    Entonces veo el mismo panel "Sugeridos de la banca"

  Escenario: Los datos personales no salen hacia ICA
    Cuando se generan las explicaciones del match
    Entonces ICA solo recibe skills, nivel, banda y disponibilidad
    Y nunca nombre, código ni datos de contacto

  Escenario: Permisos
    Dado que inicio sesión como "carlos@ibm.com" con rol "technical_ref"
    Entonces POST /ai/opportunity-draft responde 403
    Y POST /bench/match responde 403
    Y sin token ambos responden 401

  Escenario: Textos visibles
    Cuando navego por la aplicación
    Entonces el menú, los títulos y los botones dicen "Oportunidad"
    Y las rutas y la API siguen usando "processes"
```

## Escenarios añadidos por el plan (no estaban en la HU)

```gherkin
  Escenario: Fecha de inicio ausente
    Dado que el perfil no tiene fecha de inicio
    Cuando avanzo a la etapa 2
    Entonces el desglose muestra "Disponibilidad: no evaluada"
    Y los pesos de skills y banda se redistribuyen
```
