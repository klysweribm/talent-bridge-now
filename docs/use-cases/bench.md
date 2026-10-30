# Casos de uso — Banca (BENCH-1)

> Cubre `BENCH-1`: consulta de los recursos IBM en banca (empleados sin proyecto asignado). **Solo lectura**:
> no se crea, edita ni borra desde la UI, y los recursos de banca no tienen login. `MATCH-1` (match
> oportunidad vs banca) consumirá `GET /api/v1/bench`. Ver `ROADMAP.md` para el estado.

## Resumen de permisos

Los permisos por rol son provisionales hasta `RBAC-1` (`TODO(RBAC-1)` en `bench.controller.ts`).

| Acción | Reclutador | Referente Técnico | PM |
| --- | --- | --- | --- |
| Ver "Banca" en la navegación y entrar a `/bench` | ✅ | ❌ (redirige a `/dashboard`) | ✅ |
| `GET /bench`, `GET /bench/skills`, `GET /bench/:benchCode` | ✅ | ❌ 403 | ✅ |
| Cualquier llamada sin token | ❌ 401 | ❌ 401 | ❌ 401 |

## Contrato de consulta (resumen)

| Parámetro | Regla |
| --- | --- |
| `skills` | Coma o repetido. **AND**: el recurso debe tener todas. Sin distinguir mayúsculas |
| `seniority` | `jr`, `ssr`, `sr`, `lead` (coma o repetido). **OR**. Otro valor → 400 |
| `availableBy` | Solo `YYYY-MM-DD` o datetime completo. Cubre `availableFrom <= availableBy`. Semanas (`2026-W44`), ordinales (`2026-305`) y fechas imposibles → 400 |
| `country` | País exacto |
| `status` | Por defecto `available` y `soft_booked`; los `assigned` no aparecen salvo que se pidan |
| `page`, `limit` | `page` ≥ 1 (defecto 1); `limit` 1..50 (defecto 20). Nunca una consulta sin límite |
| Orden | `availableFrom` ascendente y luego `benchCode` (estable para paginar) |

`GET /bench/skills` devuelve solo skills de recursos visibles por defecto, distintas y ordenadas, para que el
filtro nunca ofrezca una skill que siempre da 0 resultados. Los recursos no incluyen email, teléfono ni salario.

## Escenarios

```gherkin
# language: es
Característica: Consultar la banca (BENCH-1)
  Como PM o reclutador
  Quiero ver y filtrar los recursos IBM en banca
  Para priorizar talento interno antes de buscar afuera

  Antecedentes:
    Dado que la banca tiene 30 recursos sembrados desde el mock

  Escenario: Listado paginado por defecto
    Dado que inicio sesión como "mariana@ibm.com" con rol "pm"
    Cuando abro "Banca"
    Entonces veo 20 recursos ordenados por fecha de disponibilidad
    Y veo el total de recursos disponibles o con reserva tentativa
    Y no aparecen recursos con estado "assigned"

  Escenario: Filtrar por skills y seniority
    Dado que estoy en "Banca" como "ana@ibm.com"
    Cuando filtro por las skills "Java" y "Spring Boot" y seniority "sr"
    Entonces solo veo recursos senior que tienen ambas skills
    Y la URL conserva los filtros al recargar la página

  Escenario: Filtrar por disponibilidad
    Cuando filtro "disponible antes de" una fecha
    Entonces solo veo recursos cuya disponibilidad es igual o anterior

  Escenario: Sin resultados
    Cuando aplico filtros que ningún recurso cumple
    Entonces veo un mensaje de banca vacía y la acción "Limpiar filtros"

  Escenario: Detalle de un recurso
    Cuando hago click en un recurso
    Entonces veo sus skills con nivel y años, idiomas y ubicación

  Escenario: Rol sin permiso
    Dado que inicio sesión como "carlos@ibm.com" con rol "technical_ref"
    Entonces no veo "Banca" en la navegación
    Y GET /api/v1/bench responde 403

  Escenario: Sin sesión
    Cuando llamo GET /api/v1/bench sin token
    Entonces responde 401

  Escenario: Parámetros inválidos
    Cuando llamo GET /api/v1/bench?limit=500
    Entonces responde 400
    Y lo mismo con seniority=guru o availableBy=no-es-fecha

  Escenario: Seed idempotente y fail-closed
    Dado que el backend arranca dos veces con BENCH_SEED_ENABLED=true
    Entonces la colección bench_resources tiene exactamente 30 documentos
    Y con BENCH_SEED_ENABLED ausente o NODE_ENV=production no se siembra nada

  Escenario: Recurso inexistente
    Cuando llamo GET /api/v1/bench/BN-9999
    Entonces responde 404
```

## Reglas de borde

- **Acceso por URL:** un Referente Técnico que entra a `/bench` es redirigido a `/dashboard` (guarda de rol
  existente); no hay vista de "acceso denegado". El 403 real lo da la API.
- **Seed:** solo con `BENCH_SEED_ENABLED=true` exacto y nunca con `NODE_ENV=production`. El upsert es por
  `benchCode`, por lo que reiniciar no duplica, pero sí restablece los datos del mock.
- **URL como estado:** filtros, página y recurso abierto viven en los search params; valores inválidos en la
  URL se descartan sin romper la pantalla, y cambiar un filtro devuelve a la página 1.
