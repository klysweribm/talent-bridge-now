import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { IAiOutputSchema } from '../../domain/interfaces/ai-topic.interface';

const FENCE = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/i;

/**
 * Parsea la salida del modelo tolerando vallas ```json y valida contra el esquema.
 * Los mensajes de error NO repiten el contenido (puede llevar datos personales).
 */
export function parseJsonOutput(raw: string, schema?: IAiOutputSchema): unknown {
  const body = FENCE.exec(raw)?.[1] ?? raw;
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch (error) {
    throw new Error('The output is not valid JSON', { cause: error });
  }
  const problem = schema?.validate(value) ?? null;
  if (problem !== null) throw new Error(problem);
  return value;
}

/**
 * Intenta `parse(raw)`; si falla, hace UNA sola llamada de reparación
 * (`repair(motivo, salidaMala)`) y vuelve a parsear. Nunca más de una.
 */
export async function parseWithRepair<T>(
  raw: string,
  parse: (raw: string) => T,
  repair: (reason: string, badRaw: string) => Promise<string>,
): Promise<T> {
  try {
    return parse(raw);
  } catch (firstError) {
    const reason = firstError instanceof Error ? firstError.message : 'Invalid output';
    const repaired = await repair(reason, raw);
    try {
      return parse(repaired);
    } catch (secondError) {
      throw new AiProviderError('The output did not validate after one repair', 'INVALID_OUTPUT', undefined, {
        cause: secondError,
      });
    }
  }
}
