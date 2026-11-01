import { AiProviderError } from '../../domain/errors/ai-provider.error';
import { parseJsonOutput, parseWithRepair } from './parse-with-repair.util';

const isArrayOfNumbers = { validate: (value: unknown): string | null => (Array.isArray(value) ? null : 'Expected an array') };

describe('parseJsonOutput', () => {
  it('should parse plain JSON', () => {
    expect(parseJsonOutput('{"a":1}')).toEqual({ a: 1 });
  });

  it.each(['```json\n{"a":1}\n```', '```\n{"a":1}\n```', '  ```json\n{"a":1}```  '])(
    'should tolerate markdown fences in %j',
    (raw) => {
      expect(parseJsonOutput(raw)).toEqual({ a: 1 });
    },
  );

  it('should throw a message without echoing the content when the JSON is invalid', () => {
    expect(() => parseJsonOutput('secreto-personal')).toThrow('The output is not valid JSON');
    expect(() => parseJsonOutput('secreto-personal')).not.toThrow(/secreto/);
  });

  it('should throw the schema message when the schema rejects the value', () => {
    expect(() => parseJsonOutput('{"a":1}', isArrayOfNumbers)).toThrow('Expected an array');
  });
});

describe('parseWithRepair', () => {
  const parse = (raw: string): unknown => parseJsonOutput(raw);

  it('should not call repair when the first output parses', async () => {
    const repair = jest.fn();

    await expect(parseWithRepair('{"a":1}', parse, repair)).resolves.toEqual({ a: 1 });
    expect(repair).not.toHaveBeenCalled();
  });

  it('should repair exactly once and return the repaired value', async () => {
    const repair = jest.fn().mockResolvedValue('{"a":2}');

    await expect(parseWithRepair('nope', parse, repair)).resolves.toEqual({ a: 2 });
    expect(repair).toHaveBeenCalledTimes(1);
    expect(repair).toHaveBeenCalledWith('The output is not valid JSON', 'nope');
  });

  it('should throw INVALID_OUTPUT when the repaired output still fails', async () => {
    const repair = jest.fn().mockResolvedValue('still nope');

    await expect(parseWithRepair('nope', parse, repair)).rejects.toMatchObject({ kind: 'INVALID_OUTPUT' });
    expect(repair).toHaveBeenCalledTimes(1);
  });

  it('should propagate the provider error when the repair call itself fails', async () => {
    const repair = jest.fn().mockRejectedValue(new AiProviderError('down', 'UNREACHABLE', 503));

    await expect(parseWithRepair('nope', parse, repair)).rejects.toMatchObject({ kind: 'UNREACHABLE' });
  });
});
