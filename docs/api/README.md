# API Documentation — IBM Talent Bridge

> La documentación Swagger interactiva está disponible en: `http://localhost:3000/api/docs`  
> Esta carpeta almacena exportaciones estáticas de la especificación OpenAPI.

## Convenciones de la API

### Base URL
```
Desarrollo: http://localhost:3000/api/v1
Producción: https://<code-engine-url>/api/v1
```

### Autenticación

Todos los endpoints (excepto `/auth/login`) requieren el header:
```
Authorization: Bearer <access_token>
```

### Formato de respuestas

**Éxito:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "Candidato no encontrado",
  "statusCode": 404,
  "timestamp": "2025-06-15T14:30:00Z"
}
```

**Paginación:**
```json
{
  "success": true,
  "data": [ ... ],
  "total": 34,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

### Códigos de Error

| Código | Significado |
|--------|-------------|
| `400` | Datos de entrada inválidos (DTO validation) |
| `401` | Token ausente o expirado |
| `403` | Sin permisos para el recurso (rol insuficiente) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (ej: candidato duplicado por email) |
| `422` | Entidad no procesable (regla de negocio violada) |
| `500` | Error interno del servidor |

### Guards de Rol

Cada endpoint indica el rol mínimo requerido:

| Decorador | Roles permitidos |
|-----------|------------------|
| `@Roles('recruiter')` | Solo Reclutador |
| `@Roles('technical_ref')` | Solo Referente Técnico |
| `@Roles('pm')` | Solo PM |
| `@Roles('recruiter', 'pm')` | Reclutador o PM |
| `@Public()` | Sin autenticación requerida |

---

## Archivos exportados

Los exports de OpenAPI (`.json` o `.yaml`) se guardan aquí con el formato:  
`openapi-v{version}-{fecha}.json`

Ejemplo: `openapi-v1.0-2025-06-15.json`

Para exportar desde el servidor en desarrollo:
```bash
curl http://localhost:3000/api/docs-json > docs/api/openapi-v1.0-$(date +%Y-%m-%d).json
```
