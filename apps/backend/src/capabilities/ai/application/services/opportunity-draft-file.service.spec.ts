import { BadRequestException, Logger } from '@nestjs/common';
import type { IDocumentTextExtractorPort } from '../../../../shared/document-text/document-text-extractor.port';
import type { OpportunityDraftError } from '../../domain/errors/opportunity-draft.error';
import type { TOpportunityDraftConfig } from '../../domain/interfaces/opportunity-draft-config.interface';
import type { IOpportunityUploadedFile, TOpportunitySourceConfig } from '../../domain/interfaces/opportunity-source.interface';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import { ENABLED_CONFIG } from '../../testing/ai-config.fixture';
import { fakeAiPort } from '../../testing/fake-ai-port';
import { AiCompletionService } from './ai-completion.service';
import { AiCoordinatorService } from './ai-coordinator.service';
import { OpportunityDraftFileService } from './opportunity-draft-file.service';
import { OpportunityDraftService } from './opportunity-draft.service';

const SECRET_TEXT = 'Fullstack senior React y NestJS para ITAU, banda 8, inicio 2026-12-01';
const SECRET_NAME = 'Requerimiento_ITAU_confidencial.pdf';
const ITAU_JSON = {
  title: 'Fullstack para ITAU', clientName: 'ITAU', opportunityRole: 'Fullstack', skills: ['Reactjs', 'Nestjs'],
  roleDescription: 'Prueba técnica de React y NestJS', band: 8, startDate: '2026-12-01',
};
const DRAFT_CONFIG: TOpportunityDraftConfig = { enabled: true, maxTextChars: 100, timeoutMs: 30_000 };
const SOURCE_CONFIG: TOpportunitySourceConfig = { maxFileBytes: 1000 };
const completion = (value: unknown): { content: string; finishReason: string; model: string } => ({ content: JSON.stringify(value), finishReason: 'stop', model: 'm' });
const withHead = (head: readonly number[], tail: string): Buffer => Buffer.concat([Buffer.from(head), Buffer.from(tail, 'latin1')]);
const pdf = (): IOpportunityUploadedFile => file(withHead([0x25, 0x50, 0x44, 0x46, 0x2d], 'cuerpo'));
const docx = (): IOpportunityUploadedFile => file(withHead([0x50, 0x4b, 0x03, 0x04], 'word/document.xml'));
const text = (value: string): IOpportunityUploadedFile => file(Buffer.from(value, 'utf8'));
function file(buffer: Buffer): IOpportunityUploadedFile { return { originalname: SECRET_NAME, mimetype: 'application/pdf', size: buffer.length, buffer }; }

let logged: string[];
beforeEach(() => {
  logged = [];
  for (const level of ['log', 'warn', 'error', 'debug', 'verbose'] as const) {
    jest.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => { logged.push(args.map(String).join(' ')); });
  }
});
afterEach(() => jest.restoreAllMocks());

function setup(sourceConfig: TOpportunitySourceConfig = SOURCE_CONFIG): {
  service: OpportunityDraftFileService; complete: ReturnType<typeof fakeAiPort>['complete']; extractText: jest.Mock;
} {
  const fake = fakeAiPort();
  fake.complete.mockResolvedValue(completion(ITAU_JSON));
  const coordinator = new AiCoordinatorService(new AiCompletionService(fake.port, ENABLED_CONFIG, {} as never), {} as never);
  const draft = new OpportunityDraftService(coordinator, DRAFT_CONFIG);
  const extractText = jest.fn().mockResolvedValue(SECRET_TEXT);
  const extractor = { extractText } as unknown as IDocumentTextExtractorPort;
  return { service: new OpportunityDraftFileService(extractor, draft, sourceConfig), complete: fake.complete, extractText };
}
const failure = (promise: Promise<unknown>): Promise<unknown> => promise.then(() => { throw new Error('should have failed'); }, (e: unknown) => e);

describe('OpportunityDraftFileService', () => {
  describe('Escenario: Generar desde un brochure', () => {
    it.each([['PDF', pdf], ['DOCX', docx]])('should return the same draft as free text for a %s', async (_name, make) => {
      const { service, extractText } = setup();

      const result = await service.draft(make());

      expect(extractText).toHaveBeenCalledTimes(1);
      expect(result.draft).toMatchObject({ clientName: 'ITAU', skills: ['React', 'NestJS'], band: 8 });
      expect(result.missingFields).toEqual([]);
    });

    it('should hand the extractor a server-chosen name and MIME, never the client ones', async () => {
      const { service, extractText } = setup();

      await service.draft(pdf());

      expect(extractText).toHaveBeenCalledWith(expect.objectContaining({ filename: 'brochure.pdf', mimeType: 'application/pdf' }));
    });

    it('should decode MD/TXT without the extractor', async () => {
      const { service, extractText, complete } = setup();

      const result = await service.draft(text('# Fullstack para ITAU'));

      expect(extractText).not.toHaveBeenCalled();
      expect(result.draft.clientName).toBe('ITAU');
      expect(JSON.stringify(complete.mock.calls[0][0])).toContain('# Fullstack para ITAU');
    });
  });

  describe('Escenario: Brochure ilegible', () => {
    it('should answer OPPORTUNITY_SOURCE_UNREADABLE when the extractor fails, without calling ICA', async () => {
      const { service, extractText, complete } = setup();
      extractText.mockRejectedValue(new BadRequestException('corrupt'));

      const error = (await failure(service.draft(pdf()))) as OpportunityDraftError;

      expect(error).toMatchObject({ name: 'OpportunityDraftError', code: 'OPPORTUNITY_SOURCE_UNREADABLE', message: 'No pudimos leer el documento' });
      expect(complete).not.toHaveBeenCalled();
    });

    it.each(['', '   \n\t  '])('should answer OPPORTUNITY_SOURCE_UNREADABLE when the PDF has no text (%p)', async (blank) => {
      const { service, extractText, complete } = setup();
      extractText.mockResolvedValue(blank);

      await expect(service.draft(pdf())).rejects.toMatchObject({ code: 'OPPORTUNITY_SOURCE_UNREADABLE' });
      expect(complete).not.toHaveBeenCalled();
    });

    it('should answer OPPORTUNITY_SOURCE_UNREADABLE for a blank MD/TXT', async () => {
      const { service } = setup();

      await expect(service.draft(text('  \n '))).rejects.toMatchObject({ code: 'OPPORTUNITY_SOURCE_UNREADABLE' });
    });

    it('should not swallow unexpected extractor errors as unreadable', async () => {
      const { service, extractText } = setup();
      extractText.mockRejectedValue(new Error('boom'));

      await expect(service.draft(pdf())).rejects.toThrow('boom');
    });
  });

  describe('Validación del archivo (400)', () => {
    it.each([
      ['missing', undefined],
      ['empty', file(Buffer.alloc(0))],
      ['unsupported type', file(withHead([0x50, 0x4b, 0x03, 0x04], 'xl/workbook.xml'))],
      ['too large', file(Buffer.alloc(1001, 0x61))],
    ])('should answer 400 for a %s file without calling ICA', async (_name, upload) => {
      const { service, complete } = setup();

      await expect(service.draft(upload)).rejects.toBeInstanceOf(BadRequestException);
      expect(complete).not.toHaveBeenCalled();
    });
  });

  describe('Texto extraído demasiado largo', () => {
    it('should answer OPPORTUNITY_TEXT_TOO_LONG without calling ICA', async () => {
      const { service, extractText, complete } = setup();
      extractText.mockResolvedValue('x'.repeat(101));

      await expect(service.draft(pdf())).rejects.toMatchObject({ code: 'OPPORTUNITY_TEXT_TOO_LONG', message: 'El texto supera el máximo de 100 caracteres' });
      expect(complete).not.toHaveBeenCalled();
    });
  });

  describe('ICA caído o lento', () => {
    it.each([['UNREACHABLE', 'AI_UNAVAILABLE'], ['TIMEOUT', 'AI_TIMEOUT']] as const)('should map %s to %s', async (reason, code) => {
      const { service, complete } = setup();
      complete.mockRejectedValue(new AiProviderError('x', reason));

      await expect(service.draft(pdf())).rejects.toMatchObject({ code });
    });
  });

  describe('Privacidad (R3)', () => {
    it('should never log the file name nor any of its content, on success or failure', async () => {
      const { service, extractText } = setup();
      await service.draft(pdf());
      extractText.mockRejectedValue(new BadRequestException(SECRET_TEXT));
      await failure(service.draft(pdf()));
      extractText.mockResolvedValue(SECRET_TEXT);
      await service.draft(text(SECRET_TEXT));

      const output = logged.join('\n');
      expect(output).not.toContain(SECRET_NAME);
      expect(output).not.toContain('confidencial');
      expect(output).not.toContain('ITAU');
      expect(output).toMatch(/bytes=\d+ latencyMs=\d+ outcome=ok/);
      expect(output).toMatch(/outcome=OPPORTUNITY_SOURCE_UNREADABLE/);
    });
  });
});
