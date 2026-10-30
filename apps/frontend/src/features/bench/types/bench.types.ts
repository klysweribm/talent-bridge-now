import type { TSeniority } from '@ibm-talent-bridge/shared-types';

export interface IBenchFilters {
  readonly skills:       readonly string[];
  readonly seniority:    readonly TSeniority[];
  readonly availableBy?: string;
  readonly country?:     string;
  readonly page?:        number;
  readonly limit?:       number;
}
