import { Injectable } from '@nestjs/common';
import { BenchService } from '../../../bench/application/services/bench.service';
import type { ISkillCatalogPort } from '../../application/ports/skill-catalog.port';

/** Catálogo de skills = el de la banca, por llamada en memoria a su servicio (ADR-013), sin tocar su colección. */
@Injectable()
export class BenchSkillCatalogAdapter implements ISkillCatalogPort {
  constructor(private readonly bench: BenchService) {}

  list(): Promise<readonly string[]> {
    return this.bench.listSkills();
  }
}
