import { BadRequestException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { ISkillCatalogPort } from '../../application/ports/skill-catalog.port';
import type { ICvFile } from '../../domain/interfaces/cv-file.interface';
import { CV_DOCX_MIME, CV_PDF_MIME } from '../../domain/constants/cv.constants';
import type { TAiUnavailableReason } from '@ibm-talent-bridge/shared-types';
import type { IDocumentTextExtractorPort } from '../../../../shared/document-text/document-text-extractor.port';
import { ClassicCvExtractor } from './classic-cv-extractor.adapter';
import type { CvIcaDraftService, TIcaDraftOutcome } from './cv-ica-draft.service';
import { LocalDocumentTextExtractor } from '../../../../shared/document-text/local-document-text-extractor.adapter';

// CV inventados (Lucia Fernandez Ortega): ningún dato real.
const fixture = (name: string, mimeType: string): ICvFile => ({
  filename: name, mimeType, data: new Uint8Array(readFileSync(join(__dirname, '../../../../shared/document-text/testing/fixtures', name))),
});
const PDF = fixture('cv-sintetico.pdf', CV_PDF_MIME);
const DOCX = fixture('cv-sintetico.docx', CV_DOCX_MIME);
const CATALOG = ['Java', 'Node.js', 'TypeScript', 'Kubernetes', 'MongoDB', 'Docker', 'Rust'];
const catalog = (names: readonly string[] = CATALOG): ISkillCatalogPort => ({ list: jest.fn().mockResolvedValue(names) });

const icaOff = (reason: TAiUnavailableReason = 'NOT_CONFIGURED'): CvIcaDraftService =>
  ({ draftFromText: jest.fn().mockResolvedValue({ ok: false, reason }) }) as unknown as CvIcaDraftService;

function withIca(outcome: TIcaDraftOutcome | Error): { extractor: ClassicCvExtractor; draftFromText: jest.Mock } {
  const draftFromText = outcome instanceof Error ? jest.fn().mockRejectedValue(outcome) : jest.fn().mockResolvedValue(outcome);
  const text: IDocumentTextExtractorPort = { extractText: jest.fn().mockResolvedValue(
    'Lucia Fernandez Ortega\nlucia.fernandez.demo@example.com\n+54 11 5555-0142\nSkills: Java, Kafka',
  ) };
  return { extractor: new ClassicCvExtractor(catalog(), text, { draftFromText } as unknown as CvIcaDraftService), draftFromText };
}

describe('ClassicCvExtractor', () => {
  it.each([['PDF', PDF], ['DOCX', DOCX]])('should extract the profile from a %s with extractor "classic"', async (_label, file) => {
    const extractor = new ClassicCvExtractor(catalog(), new LocalDocumentTextExtractor(), icaOff());

    const outcome = await extractor.extract(file);

    expect(extractor.mode).toBe('classic');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.extractor).toBe('classic');
    expect(outcome.result.draft).toMatchObject({
      fullName: 'Lucia Fernandez Ortega',
      email: 'lucia.fernandez.demo@example.com',
      phone: '+54 11 5555-0142',
    });
    expect(outcome.result.draft.skills?.map((s) => s.name)).toEqual(['Java', 'Node.js', 'TypeScript', 'Kubernetes', 'MongoDB', 'Docker']);
  });

  it('should report what it could not fill in missingFields', async () => {
    const outcome = await new ClassicCvExtractor(catalog(), new LocalDocumentTextExtractor(), icaOff()).extract(PDF);

    expect(outcome.ok && outcome.result.missingFields).toEqual(
      expect.arrayContaining(['seniority', 'yearsExperience', 'languages', 'education', 'experience', 'summary']),
    );
  });

  it('should still extract contact data when the skill catalog is unavailable, and warn', async () => {
    const failing: ISkillCatalogPort = { list: jest.fn().mockRejectedValue(new Error('bench down')) };

    const outcome = await new ClassicCvExtractor(failing, new LocalDocumentTextExtractor(), icaOff()).extract(DOCX);

    expect(outcome.ok && outcome.result.draft.email).toBe('lucia.fernandez.demo@example.com');
    expect(outcome.ok && outcome.result.draft.skills).toBeUndefined();
    expect(outcome.ok && outcome.result.warnings).toHaveLength(2); // catálogo + IA no disponible
  });

  it('should reject a file with a valid signature but unreadable content with a 400', async () => {
    const corrupt: ICvFile = { filename: 'cv.pdf', mimeType: CV_PDF_MIME, data: new Uint8Array(Buffer.from('%PDF-1.4 basura no valida')) };

    await expect(new ClassicCvExtractor(catalog(), new LocalDocumentTextExtractor(), icaOff()).extract(corrupt)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('ClassicCvExtractor completed with ICA', () => {
  const ICA_OK: TIcaDraftOutcome = {
    ok: true, warnings: [],
    draft: { fullName: 'Modelo Nombre', email: 'modelo@example.test', seniority: 'sr', yearsExperience: 8, skills: [{ name: 'java' }, { name: 'Kafka' }] },
  };

  it('should keep rules contact data, fill the rest from ICA and flag completedWith', async () => {
    const { extractor, draftFromText } = withIca(ICA_OK);

    const outcome = await extractor.extract(PDF);

    expect(outcome.ok && outcome.result).toMatchObject({
      extractor: 'classic', completedWith: 'ica-text',
      draft: { fullName: 'Lucia Fernandez Ortega', email: 'lucia.fernandez.demo@example.com', seniority: 'sr', yearsExperience: 8 },
    });
    expect(outcome.ok && outcome.result.draft.skills?.map((s) => s.name)).toEqual(['Java', 'Kafka']);
    expect(outcome.ok && outcome.result.missingFields).not.toContain('seniority');
    expect(draftFromText).toHaveBeenCalledTimes(1);
  });

  it.each<TAiUnavailableReason>(['NOT_CONFIGURED', 'TIMEOUT', 'UNAUTHORIZED'])('should return the rules-only result with a warning and no completedWith when ICA fails with %s', async (reason) => {
    const { extractor } = withIca({ ok: false, reason });

    const outcome = await extractor.extract(PDF);

    expect(outcome.ok).toBe(true);
    expect(outcome.ok && outcome.result.completedWith).toBeUndefined();
    expect(outcome.ok && outcome.result.draft.email).toBe('lucia.fernandez.demo@example.com');
    expect(outcome.ok && outcome.result.warnings).toContain('No se pudo completar con IA: se muestran solo los datos detectados por reglas.');
  });

  it('should never throw when the ICA collaborator itself throws', async () => {
    const { extractor } = withIca(new Error('boom'));

    const outcome = await extractor.extract(PDF);

    expect(outcome.ok && outcome.result.completedWith).toBeUndefined();
  });
});
