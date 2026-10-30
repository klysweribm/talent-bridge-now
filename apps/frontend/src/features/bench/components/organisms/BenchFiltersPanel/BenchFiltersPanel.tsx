import { useBenchFilters } from '../../../hooks/useBenchFilters';
import { useBenchSkills } from '../../../hooks/useBenchSkills';
import { BenchFilterBar } from '../../molecules/BenchFilterBar';

export function BenchFiltersPanel(): JSX.Element {
  const { filters, setSkills, setSeniority, setAvailableBy, setCountry, clearFilters } = useBenchFilters();
  const { data: skillOptions = [] } = useBenchSkills();

  return (
    <BenchFilterBar
      skillOptions={skillOptions}
      skills={filters.skills}
      seniority={filters.seniority}
      availableBy={filters.availableBy}
      country={filters.country}
      onSkillsChange={setSkills}
      onSeniorityChange={setSeniority}
      onAvailableByChange={setAvailableBy}
      onCountryChange={setCountry}
      onClear={clearFilters}
    />
  );
}
