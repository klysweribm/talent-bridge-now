import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICandidateProfileDraft, ICvExtractionResult, TCvExtractor } from '@ibm-talent-bridge/shared-types';
import type { ICvExtractorPort, TCvExtractionOutcome } from '../../application/ports/cv-extractor.port';
import { SKILL_CATALOG_PORT, type ISkillCatalogPort } from '../../application/ports/skill-catalog.port';
import { DOCUMENT_TEXT_EXTRACTOR_PORT, type IDocumentTextExtractorPort } from '../../../../shared/document-text/document-text-extractor.port';
import { mergeRulesWithIca } from '../../domain/classic-cv.merge';
import { extractClassicDraft } from '../../domain/classic-cv.rules';
import { findMissingFields } from '../../domain/cv-draft.sanitizer';
import { CvIcaDraftService } from './cv-ica-draft.service';
import type { ICvFile } from '../../domain/interfaces/cv-file.interface';

const ICA_UNAVAILABLE_WARNING = 'No se pudo completar con IA: se muestran solo los datos detectados por reglas.';
const CATALOG_WARNING = 'No se pudo consultar el catálogo de skills de la banca: las skills no se detectaron.';

/**
 * Extractor local por reglas: texto con `pdf-parse` / `mammoth` y heurística sobre el texto. Sin red ni IA.
 * Sin `@TraceFlow()` (recibe el CV) y sin loguear contenido: solo longitudes y nombres de error.
 */
@Injectable()
export class ClassicCvExtractor implements ICvExtractorPort {
  readonly mode: TCvExtractor = 'classic';
  private readonly logger = new Logger(ClassicCvExtractor.name);

  constructor(
    @Inject(SKILL_CATALOG_PORT) private readonly catalog: ISkillCatalogPort,
    @Inject(DOCUMENT_TEXT_EXTRACTOR_PORT) private readonly textExtractor: IDocumentTextExtractorPort,
    private readonly icaDraft: CvIcaDraftService,
  ) {}

  async extract(file: ICvFile): Promise<TCvExtractionOutcome> {
    const text = await this.textExtractor.extractText(file);
    const { skills, catalogWarnings } = await this.loadCatalog();
    const { draft, warnings } = extractClassicDraft(text, skills);
    const base = [...warnings, ...catalogWarnings];
    const completion = await this.complete(text);
    if (completion.kind === 'unavailable') return this.build(draft, [...base, ICA_UNAVAILABLE_WARNING]);
    const merged = mergeRulesWithIca(draft, completion.draft);
    return this.build(merged.draft, [...base, ...completion.warnings], merged.contributed);
  }

  private build(draft: ICandidateProfileDraft, warnings: readonly string[], completed = false): TCvExtractionOutcome {
    const result: ICvExtractionResult = {
      extractor: 'classic',
      ...(completed ? { completedWith: 'ica-text' as const } : {}),
      draft,
      missingFields: findMissingFields(draft),
      warnings,
    };
    return { ok: true, result };
  }

  /** Complemento con ICA: jamás hace fallar el modo clásico. */
  private async complete(text: string): Promise<{ kind: 'unavailable' } | { kind: 'done'; draft: ICandidateProfileDraft; warnings: readonly string[] }> {
    try {
      const outcome = await this.icaDraft.draftFromText(text);
      return outcome.ok ? { kind: 'done', draft: outcome.draft, warnings: outcome.warnings } : { kind: 'unavailable' };
    } catch (error) {
      this.logger.warn(`ICA completion failed: error=${error instanceof Error ? error.name : 'unknown'}`);
      return { kind: 'unavailable' };
    }
  }

  private async loadCatalog(): Promise<{ readonly skills: readonly string[]; readonly catalogWarnings: readonly string[] }> {
    try {
      return { skills: await this.catalog.list(), catalogWarnings: [] };
    } catch (error) {
      this.logger.warn(`Skill catalog unavailable: error=${error instanceof Error ? error.name : 'unknown'}`);
      return { skills: [], catalogWarnings: [CATALOG_WARNING] };
    }
  }
}
