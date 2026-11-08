import { SKILL_CATALOG } from './skill-catalog';

/** Quita todo lo que no es letra o dígito, salvo `#` y `+` (C#, C++): "React.js" y "react js" dan la misma clave. */
export const skillKey = (name: string): string => name.toLowerCase().replace(/[^a-z0-9#+]/g, '');

const CANONICAL_BY_KEY: ReadonlyMap<string, string> = new Map(
  SKILL_CATALOG.flatMap(({ canonical, aliases }) =>
    [canonical, ...aliases].map((name): readonly [string, string] => [skillKey(name), canonical]),
  ),
);

/** Nombre canónico si la skill está en el catálogo; si no, el texto original recortado. Vacío si no hay texto. */
export const normalizeSkill = (name: string): string => {
  const trimmed = name.trim();
  return CANONICAL_BY_KEY.get(skillKey(trimmed)) ?? trimmed;
};

/** Normaliza cada entrada, descarta las vacías y quita duplicados conservando la primera posición. */
export const normalizeSkills = (names: readonly string[]): readonly string[] =>
  names
    .map(normalizeSkill)
    .filter((skill) => skill !== '')
    .filter((skill, index, all) => all.findIndex((other) => skillKey(other) === skillKey(skill)) === index);

/** Dos nombres son la misma skill si coinciden tras pasar por el catálogo. */
export const sameSkill = (a: string, b: string): boolean => skillKey(normalizeSkill(a)) === skillKey(normalizeSkill(b));
