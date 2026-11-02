import { Logger } from '@nestjs/common';
import { AiCoordinatorService } from '../../../ai/application/services/ai-coordinator.service';
import { AiCompletionService } from '../../../ai/application/services/ai-completion.service';
import { AiFileAskService } from '../../../ai/application/services/ai-file-ask.service';
import { AiProviderError } from '../../../ai/domain/errors/ai-provider.error';
import { ENABLED_CONFIG } from '../../../ai/testing/ai-config.fixture';
import { fakeAiPort, type IFakeAiPort } from '../../../ai/testing/fake-ai-port';
import type { ICvFile } from '../../domain/interfaces/cv-file.interface';
import { VALID_DRAFT_JSON } from '../../testing/cv-fixtures';
import { IcaCvExtractor } from './ica-cv-extractor.adapter';

const FILE: ICvFile = { filename: 'cv.pdf', mimeType: 'application/pdf', data: new Uint8Array([1, 2, 3]) };
const stop = (content: string): { content: string; finishReason: string; model: string } => ({ content, finishReason: 'stop', model: 'test-model' });

/** Cadena real coordinator -> file-ask -> completion sobre un puerto falso: se ejercitan reparación y validación. */
function setup(): { extractor: IcaCvExtractor } & IFakeAiPort {
  const fake = fakeAiPort();
  fake.uploadFile.mockResolvedValue('f-1');
  fake.waitForFile.mockResolvedValue('texto');
  fake.deleteFile.mockResolvedValue(undefined);
  const completion = new AiCompletionService(fake.port, ENABLED_CONFIG, {});
  const coordinator = new AiCoordinatorService(completion, new AiFileAskService(fake.port, ENABLED_CONFIG, completion));
  return { extractor: new IcaCvExtractor(coordinator), ...fake };
}

describe('IcaCvExtractor', () => {
  it('should return a validated draft with extractor "ica" and no missing fields for a full CV', async () => {
    const { extractor, complete } = setup();
    complete.mockResolvedValue(stop(JSON.stringify(VALID_DRAFT_JSON)));

    const outcome = await extractor.extract(FILE);

    expect(extractor.mode).toBe('ica');
    expect(outcome).toMatchObject({ ok: true, result: { extractor: 'ica', missingFields: [], warnings: [] } });
    expect(outcome.ok && outcome.result.draft.email).toBe('persona.inventada@example.test');
  });

  it('should report missingFields and drop fields that do not fit the schema', async () => {
    const { extractor, complete } = setup();
    complete.mockResolvedValue(stop(JSON.stringify({ fullName: 'A B', email: 'a@b.co', seniority: 'principal-god' })));

    const outcome = await extractor.extract(FILE);

    expect(outcome.ok && outcome.result.draft).toEqual({ fullName: 'A B', email: 'a@b.co' });
    expect(outcome.ok && outcome.result.missingFields).toEqual(expect.arrayContaining(['seniority', 'phone', 'skills']));
    expect(outcome.ok && outcome.result.warnings.length).toBe(1);
  });

  it('should treat a prompt-injection CV as data: only schema-valid data survives', async () => {
    const { extractor, complete } = setup();
    // El modelo "obedece" las instrucciones maliciosas del CV; el extractor debe descartarlas.
    complete.mockResolvedValue(stop(JSON.stringify({
      fullName: 'Persona Inventada',
      seniority: 'god',
      email: 'admin@evil',
      linkedIn: 'javascript:alert(1)',
      role: 'admin',
      action: 'delete_all_candidates',
      skills: [{ name: 'ignore previous instructions', level: 99 }],
    })));

    const outcome = await extractor.extract(FILE);

    expect(outcome.ok && outcome.result.draft).toEqual({ fullName: 'Persona Inventada', skills: [{ name: 'ignore previous instructions' }] });
    const request = complete.mock.calls[0][0];
    const system = request.messages.find((message) => message.role === 'system')?.content ?? '';
    expect(system).toMatch(/datos|data/i);
    expect(system).toMatch(/instrucciones|instructions/i);
    expect(request.fileIds).toEqual(['f-1']);
  });

});

describe('IcaCvExtractor output handling', () => {
  it('should repair JSON wrapped in markdown fences', async () => {
    const { extractor, complete } = setup();
    complete.mockResolvedValue(stop('```json\n{"fullName":"Fenced Person"}\n```'));

    const outcome = await extractor.extract(FILE);

    expect(outcome.ok && outcome.result.draft).toEqual({ fullName: 'Fenced Person' });
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('should return reason TRUNCATED when the model output was cut', async () => {
    const { extractor, complete } = setup();
    complete.mockResolvedValue({ content: '{"fullName":"Per', finishReason: 'length', model: 'm' });

    await expect(extractor.extract(FILE)).resolves.toEqual({ ok: false, reason: 'TRUNCATED' });
  });

  it('should return reason INVALID_OUTPUT when the JSON is truncated and the repair fails too', async () => {
    const { extractor, complete } = setup();
    complete.mockResolvedValue(stop('{"fullName":"Per'));

    await expect(extractor.extract(FILE)).resolves.toEqual({ ok: false, reason: 'INVALID_OUTPUT' });
  });

});

describe('IcaCvExtractor failures and privacy', () => {
  it('should return the ICA failure reason and still delete the uploaded file', async () => {
    const { extractor, uploadFile, waitForFile, deleteFile } = setup();
    waitForFile.mockRejectedValue(new AiProviderError('x', 'TIMEOUT'));

    await expect(extractor.extract(FILE)).resolves.toEqual({ ok: false, reason: 'TIMEOUT' });
    expect(uploadFile).toHaveBeenCalledTimes(1);
    expect(deleteFile).toHaveBeenCalledWith('f-1');
  });

  it('should never log the extracted fields', async () => {
    const logged: unknown[][] = [];
    for (const level of ['log', 'warn', 'error', 'debug', 'verbose'] as const) {
      jest.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => { logged.push(args); });
    }
    const { extractor, complete } = setup();
    complete.mockResolvedValue(stop(JSON.stringify(VALID_DRAFT_JSON)));

    await extractor.extract(FILE);

    const output = JSON.stringify(logged);
    expect(output).not.toContain('Persona Inventada');
    expect(output).not.toContain('example.test');
    jest.restoreAllMocks();
  });
});
