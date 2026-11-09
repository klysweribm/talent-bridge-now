import type { FieldErrors } from 'react-hook-form';
import { PROCESS_FIELD_IDS } from '../constants/processFieldIds';
import type { TProcessDataValues } from '../schemas/processData.schema';
import { OPPORTUNITY_FIELD_ORDER } from './opportunityBindings';

const FIELD_ORDER = ['title', 'clientName', 'ownerPmId', 'recruiterId', ...OPPORTUNITY_FIELD_ORDER] as const;

export function focusFirstInvalid(invalid: FieldErrors<TProcessDataValues>): void {
  const first = FIELD_ORDER.find(name => invalid[name]);
  if (first) document.getElementById(PROCESS_FIELD_IDS[first])?.focus();
}
