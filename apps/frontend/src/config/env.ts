import { z } from 'zod';

/**
 * env — único punto del frontend que lee `import.meta.env`. Cualquier
 * componente/hook/infra que necesite config de entorno importa `ENV` desde
 * aquí (anti-hardcoding.md) en vez de leer `import.meta.env.VITE_*` directo.
 */
export const envSchema = z.object({
  VITE_API_URL: z.string().min(1).default('/api/v1'),
  VITE_IDLE_TIMEOUT_SECONDS: z.coerce.number().int().positive().default(360),
  VITE_IDLE_WARNING_SECONDS: z.coerce.number().int().positive().default(60),
  // Tope de tamaño del CV validado en el cliente; el backend lo aplica con CV_MAX_FILE_BYTES.
  VITE_CV_MAX_FILE_BYTES: z.coerce.number().int().positive().default(5_242_880),
  // Mock-first opt-in: 'true' usa datos simulados y NO guarda nada. Por defecto apagado: un build que omita la
  // variable (Vite la incrusta al compilar) no debe fingir que guarda candidatos.
  VITE_CANDIDATES_USE_MOCK: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
}).refine(env => env.VITE_IDLE_WARNING_SECONDS < env.VITE_IDLE_TIMEOUT_SECONDS, {
  message: 'VITE_IDLE_WARNING_SECONDS debe ser menor que VITE_IDLE_TIMEOUT_SECONDS',
  path: ['VITE_IDLE_WARNING_SECONDS'],
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
