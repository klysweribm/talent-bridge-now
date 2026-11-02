import type { IAiCompletion, IAiCompletionRequest, IAiFileUpload } from '../domain/interfaces/ai-completion.interface';
import type { IAiProviderPort } from '../application/ports/ai-provider.port';

export interface IFakeAiPort {
  readonly port: IAiProviderPort;
  readonly complete: jest.Mock<Promise<IAiCompletion>, [IAiCompletionRequest]>;
  readonly listModels: jest.Mock<Promise<readonly string[]>, []>;
  readonly uploadFile: jest.Mock<Promise<string>, [IAiFileUpload, AbortSignal?]>;
  readonly waitForFile: jest.Mock<Promise<string>, [string, AbortSignal?]>;
  readonly deleteFile: jest.Mock<Promise<void>, [string]>;
}

/** Puerto falso: los `jest.fn()` se exponen sueltos para poder afirmar sobre ellos sin `unbound-method`. */
export function fakeAiPort(): IFakeAiPort {
  const complete = jest.fn<Promise<IAiCompletion>, [IAiCompletionRequest]>();
  const listModels = jest.fn<Promise<readonly string[]>, []>();
  const uploadFile = jest.fn<Promise<string>, [IAiFileUpload, AbortSignal?]>();
  const waitForFile = jest.fn<Promise<string>, [string, AbortSignal?]>();
  const deleteFile = jest.fn<Promise<void>, [string]>();
  return { port: { complete, listModels, uploadFile, waitForFile, deleteFile }, complete, listModels, uploadFile, waitForFile, deleteFile };
}
