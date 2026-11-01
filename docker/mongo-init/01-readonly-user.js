// Crea el usuario de Mongo de SOLO LECTURA (rol `read` sobre talent-bridge) para inspeccionar
// datos sin riesgo de escribir ni borrar. Idempotente.
//
// - Mongo lo ejecuta solo, una vez, al inicializar un volumen vacío
//   (/docker-entrypoint-initdb.d). Con un volumen que ya existe NO corre solo:
//   ver docs/guides/mongo-readonly-user.md para ejecutarlo a mano.
// - Credenciales por variables de entorno (MONGO_READONLY_USER / MONGO_READONLY_PASSWORD);
//   sin contraseña no crea nada.
const dbName = 'talent-bridge';
const user = process.env.MONGO_READONLY_USER;
const pwd = process.env.MONGO_READONLY_PASSWORD;

if (!user || !pwd) {
  print('mongo-init: MONGO_READONLY_USER/MONGO_READONLY_PASSWORD no definidos, usuario de solo lectura omitido');
} else {
  const target = db.getSiblingDB(dbName);
  if (target.getUser(user)) {
    print(`mongo-init: el usuario ${user} ya existe, sin cambios`);
  } else {
    target.createUser({ user, pwd, roles: [{ role: 'read', db: dbName }] });
    print(`mongo-init: usuario de solo lectura ${user} creado en ${dbName}`);
  }
}
