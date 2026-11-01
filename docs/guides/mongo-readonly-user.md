# Datos iniciales de Mongo y usuario de solo lectura

## Datos iniciales (cuentas y banca)

No hay que ejecutar nada a mano: al arrancar el backend se siembran solos, de forma idempotente (upsert), si los flags están en `true` (por defecto en `docker-compose.yml`).

| Colección | Datos | Flag |
| --- | --- | --- |
| `users` | `apps/backend/src/capabilities/auth/infrastructure/seed/demo-users.seed.json` (ana@ recruiter, carlos@ technical_ref, mariana@ pm) | `AUTH_DEV_LOGIN_ENABLED` |
| `bench_resources` | `apps/backend/src/capabilities/bench/infrastructure/seed/bench.mock.json` (30 recursos) | `BENCH_SEED_ENABLED` |

`auth_events` no se siembra: se genera con cada login/logout y expira por TTL. Ningún seed corre con `NODE_ENV=production`.

Con un volumen vacío basta `cp .env.example .env` (completando las contraseñas) y `podman-compose up -d`.

## Usuario de solo lectura

`docker/mongo-init/01-readonly-user.js` crea `MONGO_READONLY_USER` con rol `read` sobre `talent-bridge`. Mongo lo ejecuta **solo al inicializar un volumen vacío**. Con un volumen que ya existe hay que crearlo una vez a mano (con la cuenta root):

```
podman exec -i talent-bridge-mongodb mongosh -u admin -p --authenticationDatabase admin \
  --eval 'db.getSiblingDB("talent-bridge").createUser({user:"tb_reader",pwd:passwordPrompt(),roles:[{role:"read",db:"talent-bridge"}]})'
```

Usa la misma contraseña que `MONGO_READONLY_PASSWORD` del `.env`. Para inspeccionar con ese usuario:

```
podman exec talent-bridge-mongodb mongosh -u tb_reader -p --authenticationDatabase talent-bridge talent-bridge --eval 'db.getCollectionNames()'
```

`podman-compose config` no es un paso del arranque: solo muestra el compose con las variables resueltas.

Nunca uses `podman-compose down -v`: borra el volumen de Mongo.
