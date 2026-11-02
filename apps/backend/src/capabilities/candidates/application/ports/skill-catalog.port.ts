/**
 * Puerto de salida hacia el catálogo de skills de la banca. El adapter llama en memoria al servicio de
 * `bench` (ADR-013): nunca toca su colección.
 */
export interface ISkillCatalogPort {
  list(): Promise<readonly string[]>;
}

export const SKILL_CATALOG_PORT = Symbol('SKILL_CATALOG_PORT');
