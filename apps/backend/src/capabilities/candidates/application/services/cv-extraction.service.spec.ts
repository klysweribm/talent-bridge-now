import { BadRequestException, HttpException } from '@nestjs/common';
import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import type { ICvExtractorPort, TCvExtractionOutcome } from '../ports/cv-extractor.port';
import type { ICvFile } from '../../domain/interfaces/cv-file.interface';
import type { ICvUploadedFile } from '../../domain/interfaces/cv-upload.interface';
import { fakeDocx, fakePdf, fakeLegacyDoc } from '../../testing/cv-fixtures';
import type { CandidateMatchService } from './candidate-match.service';
import { CvExtractionService } from './cv-extraction.service';

const RESULT: ICvExtractionResult = { extractor: 'ica', draft: { fullName: 'A' }, missingFields: [], warnings: [] };
const upload = (buffer: Buffer): ICvUploadedFile => ({ originalname: 'x', mimetype: 'x', size: buffer.length, buffer });

const NO_MATCHES = { similar: [] };
const fakeMatcher = (find: jest.Mock = jest.fn().mockResolvedValue(NO_MATCHES)): CandidateMatchService =>
  ({ find }) as unknown as CandidateMatchService;

function setup(outcome: TCvExtractionOutcome = { ok: true, result: RESULT }): {
  service: CvExtractionService;
  extract: jest.Mock<Promise<TCvExtractionOutcome>, [ICvFile]>;
} {
  const extract = jest.fn<Promise<TCvExtractionOutcome>, [ICvFile]>().mockResolvedValue(outcome);
  const ica: ICvExtractorPort = { mode: 'ica', extract };
  return { service: new CvExtractionService([ica], { maxFileBytes: 1024 }, fakeMatcher()), extract };
}

describe('CvExtractionService', () => {
  it('should pick the extractor by mode and pass the validated file with the detected type', async () => {
    const { service, extract } = setup();

    await expect(service.extract(upload(fakeDocx()), 'ica')).resolves.toEqual(RESULT);

    expect(extract).toHaveBeenCalledWith(expect.objectContaining({
      filename: 'cv.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }));
  });

  it('should select the ica-text extractor by mode', async () => {
    const extract = jest.fn().mockResolvedValue({ ok: true, result: { ...RESULT, extractor: 'ica-text' } });
    const service = new CvExtractionService([{ mode: 'ica', extract: jest.fn() }, { mode: 'ica-text', extract }], { maxFileBytes: 1024 }, fakeMatcher());

    await expect(service.extract(upload(fakePdf()), 'ica-text')).resolves.toMatchObject({ extractor: 'ica-text' });
    expect(extract).toHaveBeenCalledTimes(1);
  });

  it('should reject mode classic with 400 "mode not supported yet" until the adapter exists', async () => {
    const { service, extract } = setup();

    await expect(service.extract(upload(fakePdf()), 'classic')).rejects.toThrow(BadRequestException);
    await expect(service.extract(upload(fakePdf()), 'classic')).rejects.toThrow(/mode not supported yet/);
    expect(extract).not.toHaveBeenCalled();
  });

  it.each([
    ['no file', undefined],
    ['an empty file', upload(Buffer.alloc(0))],
    ['a legacy .doc', upload(fakeLegacyDoc())],
    ['a file over the size limit', upload(Buffer.concat([fakePdf(), Buffer.alloc(2048)]))],
  ])('should throw 400 without calling the extractor for %s', async (_name, file) => {
    const { service, extract } = setup();

    await expect(service.extract(file, 'ica')).rejects.toThrow(BadRequestException);
    expect(extract).not.toHaveBeenCalled();
  });

  it('should throw 503 with { reason } (never 401) when the extractor reports a failure', async () => {
    const { service } = setup({ ok: false, reason: 'UNAUTHORIZED' });

    const error = await service.extract(upload(fakePdf()), 'ica').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(503);
    expect((error as HttpException).getResponse()).toEqual({ reason: 'UNAUTHORIZED' });
  });
});
