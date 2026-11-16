import type { TSeniority } from '@ibm-talent-bridge/shared-types';
import { Button } from '@shared/components/atoms/Button';
import { AvailableByField } from '../AvailableByField';
import { CountryField } from '../CountryField';
import { SeniorityToggles } from '../SeniorityToggles';
import { SkillFilter } from '../SkillFilter';

export interface BenchFilterBarProps {
  readonly skillOptions:        readonly string[];
  readonly skills:              readonly string[];
  readonly seniority:           readonly TSeniority[];
  readonly availableBy:         string | undefined;
  readonly country:             string | undefined;
  readonly onSkillsChange:      (skills: readonly string[]) => void;
  readonly onSeniorityChange:   (seniority: readonly TSeniority[]) => void;
  readonly onAvailableByChange: (date: string | undefined) => void;
  readonly onCountryChange:     (country: string | undefined) => void;
  readonly onClear:             () => void;
}

export function BenchFilterBar(props: BenchFilterBarProps): JSX.Element {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-end gap-base bg-white p-base">
      <SkillFilter options={props.skillOptions} selected={props.skills} onChange={props.onSkillsChange} />
      <SeniorityToggles selected={props.seniority} onChange={props.onSeniorityChange} />
      <AvailableByField value={props.availableBy} onChange={props.onAvailableByChange} />
      <CountryField value={props.country} onChange={props.onCountryChange} />
      <Button variant="ghost" size="md" className="justify-self-start" onClick={props.onClear}>Limpiar filtros</Button>
    </div>
  );
}
