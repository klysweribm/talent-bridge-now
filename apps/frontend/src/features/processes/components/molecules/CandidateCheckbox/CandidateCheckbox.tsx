export interface CandidateCheckboxProps {
  readonly label:    string;
  readonly checked:  boolean;
  readonly disabled: boolean;
  readonly onToggle: () => void;
}

export function CandidateCheckbox({ label, checked, disabled, onToggle }: CandidateCheckboxProps): JSX.Element {
  return (
    <label className={`flex items-center gap-md min-h-14 px-base hover:bg-carbon-gray-hover ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} className="size-5 accent-carbon-blue-60" />
      <span className="text-body text-carbon-gray-100">{label}</span>
    </label>
  );
}
