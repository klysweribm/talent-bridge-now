/** Ids estables: `InputField` no reenvía `ref`, así que el foco al primer inválido se hace por id. */
export const PROCESS_FIELD_IDS = {
  title:           'process-title',
  clientName:      'process-client',
  ownerPmId:       'process-owner-pm',
  recruiterId:     'process-recruiter',
  opportunityRole: 'process-opportunity-role',
  skills:          'process-skills',
  band:            'process-band',
  roleDescription: 'process-role-description',
} as const;
