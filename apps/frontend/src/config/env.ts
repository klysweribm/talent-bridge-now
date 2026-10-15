import { z } from 'zod';

/**
 * env — único punto del frontend que lee `import.meta.env`. Cualquier
 * componente/hook/infra que necesite config de entorno importa `ENV` desde
 * aquí (anti-hardcoding.md) en vez de leer `import.meta.env.VITE_*` directo.
 */
export const envSchema = z.object({
  VITE_API_URL: z.string().min(1).default('/api/v1'),
});

export type TEnv = z.infer<typeof envSchema>;

function loadEnv(): TEnv {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    throw new Error(`Variables de entorno inválidas: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const ENV: TEnv = loadEnv();
