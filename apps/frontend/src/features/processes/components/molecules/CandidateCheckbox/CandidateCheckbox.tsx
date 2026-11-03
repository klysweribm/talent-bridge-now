export interface CandidateCheckboxProps {
  readonly label:    string;
  readonly checked:  boolean;
  readonly disabled: boolean;
  readonly onToggle: () => void;
}

export function CandidateCheckbox({ label, checked, disabled, onToggle }: CandidateCheckboxProps): JSX.Element {
  return (
    <label className={`flex items-center gap-md min-h-14 px-base ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} className="size-5 accent-primary-interactive" />
      <span className="text-body-md text-text-primary">{label}</span>
    </label>
  );
}
