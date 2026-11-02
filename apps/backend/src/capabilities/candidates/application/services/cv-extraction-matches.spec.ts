import { Logger } from '@nestjs/common';
import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import type { ICvExtractorPort } from '../ports/cv-extractor.port';
import type { ICvUploadedFile } from '../../domain/interfaces/cv-upload.interface';
import { fakePdf } from '../../testing/cv-fixtures';
import type { CandidateMatchService } from './candidate-match.service';
import { CvExtractionService } from './cv-extraction.service';

const RESULT: ICvExtractionResult = { extractor: 'ica', draft: { fullName: 'A' }, missingFields: [], warnings: [] };
const NO_MATCHES = { similar: [] };
const upload = (buffer: Buffer): ICvUploadedFile => ({ originalname: 'x', mimetype: 'x', size: buffer.length, buffer });
const fakeMatcher = (find: jest.Mock): CandidateMatchService => ({ find }) as unknown as CandidateMatchService;

describe('matches', () => {
  const match = { id: 'c-1', fullName: 'A', email: 'a@b.co', updatedAt: 'x', updateCount: 1, reason: 'email' as const };
  const build = (find: jest.Mock): CvExtractionService => {
    const ica: ICvExtractorPort = { mode: 'ica', extract: jest.fn().mockResolvedValue({ ok: true, result: RESULT }) };
    return new CvExtractionService([ica], { maxFileBytes: 1024 }, fakeMatcher(find));
  };

  it('should attach matches built from the extracted draft when there is an exact match', async () => {
    const find = jest.fn().mockResolvedValue({ exact: match, similar: [] });

    const result = await build(find).extract(upload(fakePdf()), 'ica');

    expect(find).toHaveBeenCalledWith(RESULT.draft);
    expect(result.matches).toEqual({ exact: match, similar: [] });
  });

  it('should attach matches when there are only similar profiles', async () => {
    const result = await build(jest.fn().mockResolvedValue({ similar: [{ ...match, reason: 'name' }] })).extract(upload(fakePdf()), 'ica');

    expect(result.matches?.similar).toHaveLength(1);
  });

  it('should omit matches when there are none', async () => {
    const result = await build(jest.fn().mockResolvedValue(NO_MATCHES)).extract(upload(fakePdf()), 'ica');

    expect(result).toEqual(RESULT);
    expect(result).not.toHaveProperty('matches');
  });

  it('should return the extraction without matches, logging only the error name, when the lookup throws', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const find = jest.fn().mockRejectedValue(new TypeError('boom persona@secreta.test'));

    const result = await build(find).extract(upload(fakePdf()), 'ica');

    expect(result).toEqual(RESULT);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('TypeError'));
    expect(JSON.stringify(warn.mock.calls)).not.toContain('secreta');
    warn.mockRestore();
  });
});
