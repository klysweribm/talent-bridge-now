import { normalizeSkill, normalizeSkills, skillKey, sameSkill } from './skill-normalizer';

describe('normalizeSkill', () => {
  it.each([
    ['React', 'React'],
    ['React.js', 'React'],
    ['Reactjs', 'React'],
    ['react js', 'React'],
    ['REACT', 'React'],
    ['NestJS', 'NestJS'],
    ['Nestjs', 'NestJS'],
    ['Nest.js', 'NestJS'],
    ['Node', 'Node.js'],
    ['Node.js', 'Node.js'],
    ['nodejs', 'Node.js'],
    ['k8s', 'Kubernetes'],
    ['Mongo', 'MongoDB'],
    ['Amazon Web Services', 'AWS'],
    ['aws', 'AWS'],
    ['SpringBoot', 'Spring Boot'],
  ])('should map "%s" to "%s"', (input, expected) => {
    expect(normalizeSkill(input)).toBe(expected);
  });

  it('should keep unknown skills as written (trimmed), never drop them', () => {
    expect(normalizeSkill('  Elixir  ')).toBe('Elixir');
    expect(normalizeSkill('Haskell')).toBe('Haskell');
  });

  it('should not confuse skills that only share letters', () => {
    expect(normalizeSkill('C#')).toBe('C#');
    expect(normalizeSkill('.NET')).toBe('.NET');
    expect(normalizeSkill('SAP FI')).toBe('SAP FI');
    expect(normalizeSkill('SAP')).toBe('SAP');
  });

  it('should return an empty string for blank input', () => {
    expect(normalizeSkill('   ')).toBe('');
  });
});

describe('normalizeSkills', () => {
  it('should normalize every entry keeping the order', () => {
    expect(normalizeSkills(['Reactjs', 'Nestjs', 'Elixir'])).toEqual(['React', 'NestJS', 'Elixir']);
  });

  it('should remove duplicates that collapse to the same skill, keeping the first position', () => {
    expect(normalizeSkills(['React', 'React.js', 'Node', 'Node.js'])).toEqual(['React', 'Node.js']);
  });

  it('should drop blank entries', () => {
    expect(normalizeSkills(['React', '', '  '])).toEqual(['React']);
  });

  it('should return an empty list for an empty input', () => {
    expect(normalizeSkills([])).toEqual([]);
  });
});

describe('skillKey / sameSkill', () => {
  it('should give the same key to aliases and a different key to different skills', () => {
    expect(skillKey('React.js')).toBe(skillKey('reactjs'));
    expect(skillKey('React')).not.toBe(skillKey('Angular'));
  });

  it('should compare skills through the catalog', () => {
    expect(sameSkill('Nestjs', 'NestJS')).toBe(true);
    expect(sameSkill('Node', 'Node.js')).toBe(true);
    expect(sameSkill('Java', 'JavaScript')).toBe(false);
  });
});
