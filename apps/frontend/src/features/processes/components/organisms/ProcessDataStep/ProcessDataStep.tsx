import { Button } from '@shared/components/atoms/Button';
import { useAuthStore } from '@features/auth/store/auth.store';
import { DATA_STEP_TEXT, WIZARD_TEXT } from '../../../config/processWizard.constants';
import { useOpportunityDraft } from '../../../hooks/useOpportunityDraft';
import { useProcessDataForm } from '../../../hooks/useProcessDataForm';
import { useUserOptions } from '../../../hooks/useUserOptions';
import { DataFields } from '../../molecules/DataFields';
import { ErrorBanner } from '../../molecules/ErrorBanner';
import { OpportunityFields } from '../../molecules/OpportunityFields/OpportunityFields';
import { OpportunityDraftPanel } from '../../molecules/OpportunityDraftPanel/OpportunityDraftPanel';
import { StepHeading } from '../../molecules/StepHeading';

export function ProcessDataStep(): JSX.Element {
  const isRecruiter = useAuthStore(state => state.user?.role) === 'recruiter';
  const form = useProcessDataForm(isRecruiter ? 'recruiter' : 'pm');
  const draft = useOpportunityDraft(form);
  const users = useUserOptions(isRecruiter ? 'pm' : 'recruiter');
  const userField = isRecruiter ? 'ownerPmId' : 'recruiterId';
  return (
    <form noValidate onSubmit={form.onSubmit} className="flex flex-col gap-lg">
      <StepHeading>{DATA_STEP_TEXT.heading}</StepHeading>
      {form.bannerCount > 0 && <ErrorBanner message={DATA_STEP_TEXT.errorsBanner(form.bannerCount)} />}
      {users.isError && (
        <ErrorBanner message={DATA_STEP_TEXT.usersError} actionLabel={WIZARD_TEXT.retry} onAction={() => { void users.refetch(); }} />
      )}
      <OpportunityDraftPanel draft={draft} />
      <DataFields
        title={form.values.title} clientName={form.values.clientName} titleMark={draft.marks.title} clientMark={draft.marks.clientName}
        titleError={form.errors.title?.message} clientError={form.errors.clientName?.message}
        onTitle={form.onTextChange('title')} onClient={form.onTextChange('clientName')}
        onBlurTitle={() => form.touchField('title')} onBlurClient={() => form.touchField('clientName')}
        isRecruiter={isRecruiter} userOptions={users.data?.data ?? []}
        userValue={form.values[userField]} userError={form.errors[userField]?.message}
        onUser={value => form.setField(userField, value)} onBlurUser={() => form.touchField(userField)}
      />
      <OpportunityFields bindings={form.opportunity} marks={draft.marks} />
      <div className="flex justify-end">
        <Button type="submit" className="min-h-11" disabled={!form.canSubmit}>{WIZARD_TEXT.next}</Button>
      </div>
    </form>
  );
}
