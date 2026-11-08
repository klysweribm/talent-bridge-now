import { SetMetadata } from '@nestjs/common';

export const NO_BODY_LOG_KEY = 'flowLog:noBody';

/**
 * Marca un handler (o un controller entero) cuyo body de petición y respuesta lleva texto libre o PII:
 * FlowLog imprime solo `{ omitted: true, length }` en lugar del contenido.
 */
export const NoBodyLog = (): MethodDecorator & ClassDecorator => SetMetadata(NO_BODY_LOG_KEY, true);
