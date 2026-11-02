import { AiProviderError } from '../../domain/errors/ai-provider.error';
import { buildIcaChatRequest, mapIcaChatResponse, mapIcaModelsResponse } from './ica-chat-request.mapper';

function thrownKind(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (error) {
    return error instanceof AiProviderError ? error.kind : undefined;
  }
  return undefined;
}

const MESSAGES = [{ role: 'system', content: 'S' }, { role: 'user', content: 'U' }] as const;

describe('buildIcaChatRequest', () => {
  it('should build the exact OpenAI-style body without temperature, stream or files', () => {
    expect(buildIcaChatRequest({ messages: MESSAGES }, 'm', 100, false)).toEqual({
      model: 'm', messages: MESSAGES, max_tokens: 100,
    });
  });

  it('should add response_format json_object only when json mode is on', () => {
    expect(buildIcaChatRequest({ messages: MESSAGES }, 'm', 100, true)).toMatchObject({ response_format: { type: 'json_object' } });
    expect(buildIcaChatRequest({ messages: MESSAGES }, 'm', 100, false)).not.toHaveProperty('response_format');
  });

  it('should never send temperature', () => {
    expect(buildIcaChatRequest({ messages: MESSAGES }, 'm', 100, true)).not.toHaveProperty('temperature');
  });
});

describe('mapIcaChatResponse', () => {
  it('should map content, finish reason, model and usage', () => {
    const json = {
      model: 'real-model',
      choices: [{ message: { content: 'hola' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 3, completion_tokens: 4 },
    };

    expect(mapIcaChatResponse(json, 'fallback')).toEqual({
      content: 'hola', finishReason: 'stop', model: 'real-model', usage: { promptTokens: 3, completionTokens: 4 },
    });
  });

  it('should fall back to the requested model and omit usage when absent', () => {
    expect(mapIcaChatResponse({ choices: [{ message: { content: 'x' }, finish_reason: 'length' }] }, 'fallback')).toEqual({
      content: 'x', finishReason: 'length', model: 'fallback',
    });
  });

  it.each([{}, { choices: [] }, { choices: [{ message: { content: null } }] }, null, 'texto'])(
    'should throw INVALID_OUTPUT when the body has no content: %j',
    (json) => {
      expect(() => mapIcaChatResponse(json, 'm')).toThrow(AiProviderError);
      expect(thrownKind(() => mapIcaChatResponse(json, 'm'))).toBe('INVALID_OUTPUT');
    },
  );
});

describe('mapIcaModelsResponse', () => {
  it('should return the model ids', () => {
    expect(mapIcaModelsResponse({ data: [{ id: 'a' }, { id: 'b', name: 'B' }, { name: 'sin-id' }] })).toEqual(['a', 'b']);
  });

  it.each([{}, null, { data: 'x' }])('should throw INVALID_OUTPUT for %j', (json) => {
    expect(thrownKind(() => mapIcaModelsResponse(json))).toBe('INVALID_OUTPUT');
  });
});

describe('buildIcaChatRequest files', () => {
  it('should add the files field only when file ids are given', () => {
    const messages = [{ role: 'user', content: 'U' }] as const;

    expect(buildIcaChatRequest({ messages, fileIds: ['a', 'b'] }, 'm', 9, false)).toMatchObject({
      files: [{ type: 'file', id: 'a' }, { type: 'file', id: 'b' }],
    });
    expect(buildIcaChatRequest({ messages }, 'm', 9, false)).not.toHaveProperty('files');
    expect(buildIcaChatRequest({ messages, fileIds: [] }, 'm', 9, false)).not.toHaveProperty('files');
  });
});
