import type { IOpportunityLimits } from '@ibm-talent-bridge/shared-types';
import type { IOpportunityLimitsView } from './opportunityBindings';
import { useProcessLimits } from './useProcessLimits';

/** Límites de la oportunidad del servidor + la vista (carga/error/reintento) que consumen los campos. */
export function useOpportunityLimits(): { readonly limits: IOpportunityLimits | undefined; readonly limitsView: IOpportunityLimitsView } {
  const query = useProcessLimits();
  const limits = query.data?.opportunity;
  return { limits, limitsView: { data: limits, failed: query.isError, retry: () => { void query.refetch(); } } };
}
