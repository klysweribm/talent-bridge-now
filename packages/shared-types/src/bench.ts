// BENCH — recursos de bench (empleados IBM sin proyecto). Solo tipos.
// Sin PII: nombres ficticios, sin email/teléfono/salario.

export type TSeniority = 'jr' | 'ssr' | 'sr' | 'lead';
export type TBenchStatus = 'available' | 'soft_booked' | 'assigned';
export type TSkillLevelValue = 1 | 2 | 3 | 4 | 5;
export type TLanguageProficiency = 'basic' | 'intermediate' | 'advanced' | 'native';

export interface ISkillLevel {
  readonly name: string;
  readonly level: TSkillLevelValue;
  readonly years: number;
}

export interface ILanguageLevel {
  /** ISO 639-1 */
  readonly code: string;
  readonly level: TLanguageProficiency;
}

export interface IBenchLocation {
  readonly country: string;
  readonly city: string;
}

export interface IBenchResource {
  readonly id: string;
  /** Único, p. ej. "BN-0001" */
  readonly benchCode: string;
  readonly displayName: string;
  readonly primaryRole: string;
  readonly practice: string;
  readonly seniority: TSeniority;
  readonly skills: readonly ISkillLevel[];
  readonly languages: readonly ILanguageLevel[];
  readonly location: IBenchLocation;
  /** ISO date */
  readonly benchSince: string;
  /** ISO date */
  readonly availableFrom: string;
  readonly status: TBenchStatus;
}

export interface IBenchQuery {
  readonly skills?: readonly string[];
  readonly seniority?: readonly TSeniority[];
  readonly availableBy?: string;
  readonly country?: string;
  readonly status?: readonly TBenchStatus[];
  readonly page?: number;
  readonly limit?: number;
}
