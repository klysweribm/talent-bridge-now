import type { IAiCompletion, IAiCompletionRequest } from '../domain/interfaces/ai-completion.interface';
import type { IAiProviderPort } from '../application/ports/ai-provider.port';

export interface IFakeAiPort {
  readonly port: IAiProviderPort;
  readonly complete: jest.Mock<Promise<IAiCompletion>, [IAiCompletionRequest]>;
  readonly listModels: jest.Mock<Promise<readonly string[]>, []>;
}

/** Puerto falso: los `jest.fn()` se exponen sueltos para poder afirmar sobre ellos sin `unbound-method`. */
export function fakeAiPort(): IFakeAiPort {
  const complete = jest.fn<Promise<IAiCompletion>, [IAiCompletionRequest]>();
  const listModels = jest.fn<Promise<readonly string[]>, []>();
  return { port: { complete, listModels }, complete, listModels };
}
