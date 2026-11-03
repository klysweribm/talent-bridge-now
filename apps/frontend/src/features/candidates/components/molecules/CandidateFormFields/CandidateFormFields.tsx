import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { EMAIL_LOCKED_HINT, FIELD_LABELS, SKILLS_HINT } from '../../../config/candidates.constants';
import { EMAIL_VALID_COPY } from '../../../config/candidates.copy';
import type { ICandidateFormValues } from '../../../utils/draftMapping';
import { CandidateTextAreaField } from '../CandidateTextAreaField';
import { CandidateTextField } from '../CandidateTextField';
import { SeniorityField } from '../SeniorityField';

export interface CandidateFormFieldsProps {
  readonly register: UseFormRegister<ICandidateFormValues>;
  readonly errors: FieldErrors<ICandidateFormValues>;
  readonly missing: ReadonlySet<string>;
  /** Modo actualización: el correo identifica al perfil y el backend rechaza cambiarlo, así que no se edita. */
  readonly emailLocked?: boolean;
  /** El correo escrito tiene formato válido: se muestra el indicador de éxito. */
  readonly emailValid?: boolean;
}

interface IFieldExtra {
  readonly required?: boolean;
  readonly label?: string;
  readonly readOnly?: boolean;
  readonly hint?: string;
  readonly success?: string;
}

type TFieldName = keyof typeof FIELD_LABELS;

/** Un campo de texto del formulario, cableado a react-hook-form, a sus errores y al aviso de "no detectado". */
function TextFieldFor({ name, form, extra = {} }: { readonly name: TFieldName; readonly form: CandidateFormFieldsProps; readonly extra?: IFieldExtra }): JSX.Element {
  return (
    <CandidateTextField
      label={extra.label ?? FIELD_LABELS[name]}
      aria-required={extra.required}
      readOnly={extra.readOnly}
      hint={extra.hint}
      success={extra.success}
      error={form.errors[name]?.message}
      missing={form.missing.has(name)}
      {...form.register(name)}
    />
  );
}

export function CandidateFormFields(form: CandidateFormFieldsProps): JSX.Element {
  const { register, errors, missing, emailLocked = false, emailValid = false } = form;
  const email: IFieldExtra = { required: true, label: `${FIELD_LABELS.email} *`, readOnly: emailLocked, hint: emailLocked ? EMAIL_LOCKED_HINT : undefined, success: emailValid ? EMAIL_VALID_COPY : undefined };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-base">
      <TextFieldFor name="fullName" form={form} extra={{ required: true, label: `${FIELD_LABELS.fullName} *` }} />
      <TextFieldFor name="email" form={form} extra={email} />
      <TextFieldFor name="phone" form={form} />
      <TextFieldFor name="linkedIn" form={form} />
      <TextFieldFor name="country" form={form} />
      <TextFieldFor name="city" form={form} />
      <TextFieldFor name="primaryRole" form={form} />
      <SeniorityField missing={missing.has('seniority')} {...register('seniority')} />
      <TextFieldFor name="yearsExperience" form={form} />
      <CandidateTextAreaField label={FIELD_LABELS.skills} hint={SKILLS_HINT} error={errors.skills?.message} missing={missing.has('skills')} {...register('skills')} />
      <TextFieldFor name="summary" form={form} />
    </div>
  );
}
